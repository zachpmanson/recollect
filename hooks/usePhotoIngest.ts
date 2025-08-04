import useDb from "@/db/useDb";
import dayjs from "dayjs";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";

export const FOLDER = "file:///storage/emulated/0/DCIM/Camera/";

async function getFileModDate(file: string) {
  const info = await FileSystem.getInfoAsync(file);
  if (!info.exists) {
    console.error(`File does not exist: ${file}`);
    throw new Error(`File does not exist: ${file}`);
  }

  const modTime = info.modificationTime;
  const date = dayjs(info.modificationTime * 1000);

  return date;
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
          return { ...i, original_date: await getFileModDate(i.original_path) };
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

  async function loadNImage(n: number, singleDay: boolean = false) {
    console.log(`Loading ${n} images, singleDay: ${singleDay}`);
    if (singleDay) {
      const randImg = await db.repositories.image.getNPending(1);
      console.debug("Random image for single day:", randImg);
      return await db.repositories.image.getNPending(n, randImg[0].original_date);
    } else {
      return await db.repositories.image.getNPending(n);
    }
  }

  // async function pickDay() {
  //   const i = await db.repositories.image.getNPending(1);
  // }

  return { loadNImage, ingesting };
}
