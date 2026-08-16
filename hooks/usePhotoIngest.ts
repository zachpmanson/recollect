import useDb from "@/db/useDb";
import { ImageModel } from "@/db/images";
import dayjs from "dayjs";
import * as FileSystem from "expo-file-system";
import { File } from "expo-file-system/next";
import * as MediaLibrary from "expo-media-library";
import "./exifr-setup"; // must run before exifr loads (navigator.userAgent shim)
import exifr from "exifr/dist/lite.esm.js";
import { useEffect, useState } from "react";
import { dateFromFilename } from "@/utils/files";

export const FOLDER = "file:///storage/emulated/0/DCIM/Camera/";

// EXIF date tags live in the first few KB after the JPEG SOI marker (and early
// in HEIC's meta box), so reading just the head of a camera file is enough.
const EXIF_READ_LIMIT = 512 * 1024;

async function getFileModDate(file: string) {
  const info = await FileSystem.getInfoAsync(file);
  if (!info.exists) {
    console.error(`File does not exist: ${file}`);
    throw new Error(`File does not exist: ${file}`);
  }

  return dayjs(info.modificationTime * 1000);
}

async function getExifDate(uri: string): Promise<dayjs.Dayjs | null> {
  try {
    const file = new File(uri);
    if (!file.exists) return null;
    const size = file.size ?? 0;
    if (size === 0) return null;

    // Read only the head of the file — EXIF date tags sit just after the
    // JPEG SOI / HEIC meta box, so a full read of multi-MB camera files is
    // unnecessary.
    const handle = file.open();
    let head: Uint8Array;
    try {
      handle.offset = 0;
      head = handle.readBytes(Math.min(size, EXIF_READ_LIMIT));
    } finally {
      handle.close();
    }

    // exifr lite build — no options: its option-filtering path throws
    // ("undefined is not iterable", exifr 7.1.3 bug), but a plain parse
    // returns EXIF + XMP tags fine (and skips GPS/ICC etc. in this build).
    const tags = await exifr.parse(head);
    if (!tags) return null;
    const date = tags.DateTimeOriginal ?? tags.CreateDate ?? tags.ModifyDate;
    return date ? dayjs(date as Date) : null;
  } catch (error) {
    console.warn(`No EXIF date for ${uri}:`, error);
    return null;
  }
}

async function getFiles() {
  try {
    const files = await FileSystem.readDirectoryAsync(FOLDER);
    return files;
  } catch (error) {
    return [];
  }
}

export default function usePhotoIngest() {
  const db = useDb();
  const [ingesting, setIngesting] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  // const [day, setDay] = useState<Dayjs>();

  // async function setOriginalDate(image: ImageModel) {
  //   const info = await getFileInfo(image.original_path);
  //   if (info.modificationTime) {
  //     const date = dayjs(info.modificationTime * 1000);
  //     // console.debug(`Setting original date for ${image.original_path} to ${date.format("YYYY-MM-DD")}`);
  //     await db.repositories.image.setOriginalDate(image.id, date);
  //   }
  // }

  async function bulkAllOriginalDate() {
    console.log("Bulk setting original dates for images without dates");
    const batchSize = 1000;
    let images = await db.repositories.image.getMissingOriginalDate(batchSize);
    while (images.length !== 0) {
      console.log(`Setting original date for ${images.length} images`);
      const startTime = new Date();

      const modDates = await Promise.allSettled(
        images.map(async (i) => {
          // Prefer the camera's EXIF timestamp; fall back to the file's
          // modification time when the image has no EXIF date.
          const exifDate = await getExifDate(i.original_path);
          return { ...i, original_date: exifDate ?? (await getFileModDate(i.original_path)) };
        })
      );
      const fulfilled = modDates.filter((r) => r.status === "fulfilled");
      db.repositories.image.upsertOriginalDates(fulfilled.map((r) => r.value));
      const endTime = new Date();
      console.log(`Time taken to get file info: ${endTime.getTime() - startTime.getTime()} ms`);

      images = await db.repositories.image.getMissingOriginalDate(batchSize);
    }
  }

  async function updateFolderInDb() {
    setIngesting(true);
    const files = await getFiles();
    const fileObjs = files.map((f) => {
      return {
        original_path: `${FOLDER}${f}`,
        status: "pending" as const,
      };
    });
    console.log(`Found ${files.length} files`);
    // console.log(fileObjs.slice(0, 10));
    try {
      await db.repositories.image.bulkUpsert(fileObjs);
    } catch (e) {
      console.error(e);
    }
    setIngesting(false);
  }

  async function getPerms() {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }
  }

  async function setup() {
    await getPerms();
    console.log("setup perms ", permissionResponse?.status);
    if (permissionResponse?.status === "granted") {
      await updateFolderInDb();
      await bulkAllOriginalDate();
    }
  }

  useEffect(() => {
    console.log("Checking permissions on mount:", permissionResponse?.status);
    setup().then();
  }, [permissionResponse?.status]);

  async function loadNImage(n: number, singleDay: boolean = false, excludeNameModMatch = false) {
    console.log(`Loading ${n} images, singleDay: ${singleDay}, excludeNameModMatch: ${excludeNameModMatch}`);
    // Fetch a larger pool so we can drop "already dated" images and still
    // return a full batch.
    const pool = 3 * n;
    let images: ImageModel[];
    if (singleDay) {
      const randImg = await db.repositories.image.getNPending(1);
      console.debug("Random image for single day:", randImg);
      images = await db.repositories.image.getNPending(pool, randImg[0]?.original_date);
    } else {
      images = await db.repositories.image.getNPending(pool);
    }

    if (!excludeNameModMatch) return images.slice(0, n);

    // Exclude images whose filename date and file modification date already
    // agree — they're effectively dated already, so skip re-deciding them.
    const kept: ImageModel[] = [];
    for (const img of images) {
      if (kept.length >= n) break;
      const nameDate = dateFromFilename(img.original_path);
      if (!nameDate) {
        kept.push(img);
        continue;
      }
      try {
        const info = await FileSystem.getInfoAsync(img.original_path);
        if (!info.exists) {
          kept.push(img);
          continue;
        }
        const modDate = dayjs(info.modificationTime * 1000);
        if (!modDate.isSame(nameDate, "day")) kept.push(img);
      } catch (error) {
        // Never drop an image because the stat failed.
        console.warn(`Could not stat ${img.original_path}:`, error);
        kept.push(img);
      }
    }
    return kept;
  }

  // async function pickDay() {
  //   const i = await db.repositories.image.getNPending(1);
  // }

  return { loadNImage, ingesting };
}
