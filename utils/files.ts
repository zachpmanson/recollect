import dayjs, { Dayjs } from "dayjs";
import * as FileSystem from "expo-file-system";

export async function getFileInfo(file: string) {
  try {
    const info = await FileSystem.getInfoAsync(file);
    // const modificationTime = "modificationTime" in info ? info.modificationTime : "";
    return info;
  } catch (error) {
    console.error("Error getting file info:", error);
    return [];
  }
}

export async function getFileModDate(file: string) {
  const info = await getFileInfo(file);
  if (Array.isArray(info) || !info.exists) {
    console.error(`File does not exist: ${file}`);
    return undefined;
  }
  if ("modificationTime" in info) {
    return dayjs(info.modificationTime * 1000); // Convert to milliseconds
  }
  return undefined;
}

// Example: Creating a new File with a custom lastModified date
const createCustomFile = () => {
  const fileContent = "This is the content of my custom file.";
  const fileName = "myCustomFile.txt";
  const customDate = new Date(2023, 0, 15, 10, 30, 0); // January 15, 2023, 10:30:00 AM

  // Create a Blob from the file content
  const blob = new Blob([fileContent], { type: "text/plain" });

  // Create the File object with the specified lastModified date
  const customFile = new File([blob], fileName, {
    lastModified: customDate.getTime(), // lastModified expects a timestamp in milliseconds
    type: "text/plain",
  });

  console.log("Custom File:", customFile);
  console.log("Last Modified Date:", new Date(customFile.lastModified));
};

export function dateFromFilename(filename: string | undefined): Dayjs | null {
  const potentialDates = filename?.match(/20\d\d\d\d\d\d/);
  const nameDatesStr = potentialDates?.[0];
  const nameDate = nameDatesStr
    ? dayjs(`${nameDatesStr.slice(0, 4)}-${nameDatesStr.slice(4, 6)}-${nameDatesStr.slice(6, 8)}`)
    : null;

  return nameDate;
}
