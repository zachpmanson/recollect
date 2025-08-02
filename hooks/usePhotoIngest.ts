import useDb from "@/db/useDb";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";

export const FOLDER = "file:///storage/emulated/0/DCIM/Camera/";

async function getFileInfo(file: string) {
  try {
    const info = await FileSystem.getInfoAsync(file);
    const modificationTime = "modificationTime" in info ? info.modificationTime : "";
    return info;
  } catch (error) {
    console.error("Error getting file info:", error);
    return [];
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
    console.log(fileObjs.slice(0, 10));
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
    }
  }

  useEffect(() => {
    setup().then();
  }, [permissionResponse?.status]);

  async function loadNImage(n: number) {
    console.log(`Loading ${n} images`);
    return await db.repositories.image.getNPending(n);
  }

  // async function pickDay() {
  //   const i = await db.repositories.image.getNPending(1);
  // }

  return { loadNImage, ingesting };
}
