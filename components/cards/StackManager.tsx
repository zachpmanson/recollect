import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Load } from "../ui/LoadingSpinner";
import { CardItem } from "./Card";
import CardStack from "./CardStack";
import DebugModal from "./DebugModal";

export type CardStatus = "pending" | "accepted" | "rejected" | "deleted";
type CardData = { card: CardItem; status: CardStatus };
export const FOLDER = "file:///storage/emulated/0/DCIM/Camera/";

async function getFiles() {
  try {
    const files = await FileSystem.readDirectoryAsync(FOLDER);
    return files;
  } catch (error) {
    return [];
  }
}

/** Marshalls card blocks */
export default function StackManager() {
  const [loadingStatus, setLoadingStatus] = useState<"loading-all-files" | "loading-batch" | "nothing">(
    "loading-all-files"
  );
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [allImages, setAllImages] = useState<string[]>([]);

  const [currentCards, setCurrentCards] = useState<CardData[]>([]);
  const cards = useMemo(() => {
    return currentCards.map(({ card }) => card);
  }, [currentCards]);

  async function loadNImage(n: number) {
    console.log("Loading N images", n);
    setCurrentCards([]);
    setLoadingStatus("loading-batch");
    const newFiles: CardData[] = [];
    for (let i = 0; i < n; i++) {
      const file = allImages[Math.floor(Math.random() * allImages.length)];
      if (file) {
        newFiles.push({
          card: {
            id: i,
            ukey: `Card ${i} ${file}`,
            title: `${file}`,
            file: `${FOLDER}${file}`,
          },
          status: "pending",
        });
      }
    }

    setCurrentCards((o) => [...o, ...newFiles]);
    setLoadingStatus("nothing");
  }

  async function setup() {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }
    const files = await getFiles();
    setAllImages(files);
  }

  function setStatus(id: number, status: CardStatus) {
    setCurrentCards((old) => {
      const newCards = [...old];
      newCards[id].status = status;
      return newCards;
    });
  }

  useEffect(() => {
    setup().then();
  }, []);

  useEffect(() => {
    if (allImages.length > 0) {
      newBatch();
    }
  }, [allImages]);

  const allStatusSet = useMemo(() => {
    if (currentCards.length === 0) return false;
    return currentCards.every((c) => c.status !== "pending");
  }, [currentCards]);

  useEffect(() => {
    if (allStatusSet) {
      console.log("All cards have been set");
      setLoadingStatus("loading-batch");
      setTimeout(() => {
        newBatch();
      }, 1000);
    }
  }, [allStatusSet]);

  function newBatch() {
    loadNImage(10).then();
  }

  return (
    <>
      <View
        style={{
          minHeight: 500,
          flexGrow: 1,
        }}
      >
        <Load isLoading={allStatusSet || loadingStatus !== "nothing"}>
          <CardStack getNewBatch={newBatch} cards={cards} setStatus={setStatus} />
        </Load>
      </View>
      <DebugModal>
        <Text>loadingStatus: {loadingStatus}</Text>
        <Text>{JSON.stringify({ allStatusSet, currentCards }, null, 2)}</Text>
      </DebugModal>
    </>
  );
}
