import { ImageModel, ImageStatus } from "@/db/images";
import useDb from "@/db/useDb";
import usePhotoIngest from "@/hooks/usePhotoIngest";
import { Button } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import DateSetter from "../DateSetter";
import TSwitch from "../ThemedSwitch";
import CardStack from "./CardStack";
import DebugModal from "./DebugModal";

export type ImageWithPosition = ImageModel & { position: number };

/** Marshalls card blocks */
export default function StackManager() {
  const db = useDb();

  const { loadNImage, ingesting } = usePhotoIngest();
  const [singleDay, setSingleDay] = useState(true);
  const [immediateDate, setImmediateDate] = useState(false);
  const [editingImg, setEditingImage] = useState<ImageModel>();

  const [loading, setLoading] = useState(false);

  const [currentCards, setCurrentCards] = useState<ImageModel[]>([]);

  function setStatus(img: ImageWithPosition, status: ImageStatus) {
    const pending = currentCards.filter((c) => c.status === "pending");
    db.repositories.image
      .setStatus(img.id, status)
      .then(() => {
        if (pending.length === 1) newBatch().then();

        setCurrentCards((prev) => {
          const next = [...prev];
          next[img.position].status = status;
          return next;
        });
      })
      .catch((e) => console.error(e));

    if (status === "rejected" && immediateDate) {
      setEditingImage(img);
    }
  }

  useEffect(() => {
    const allStatusSet = currentCards.length > 0 && currentCards.every((c) => c.status !== "pending");
    if (allStatusSet) {
      console.log("All cards have been set");
      newBatch().then();
    }
  }, [currentCards]);

  async function newBatch() {
    console.log("Getting new batch");
    setLoading(true);
    const images = await loadNImage(10, singleDay);
    setCurrentCards(images);
    setLoading(false);
  }

  useEffect(() => {
    console.log("ingesting:", ingesting);
    if (!ingesting && currentCards.length === 0) {
      newBatch().then();
    }
  }, [ingesting]);

  useEffect(() => {
    newBatch().then();
  }, []);

  return (
    <>
      <View
        style={{
          minHeight: 500,
          flexGrow: 1,
        }}
      >
        {/* <Load isLoading={loading || currentCards.length === 0}> */}
        <CardStack
          isLoading={loading}
          getNewBatch={newBatch}
          cards={currentCards.map((currentCards, i) => ({
            ...currentCards,
            position: i,
          }))}
          setStatus={setStatus}
        />
        {/* </Load> */}
      </View>
      <DebugModal>
        <TSwitch value={singleDay} onChange={() => setSingleDay((o) => !o)} label="Single Day" />
        <TSwitch value={immediateDate} onChange={() => setImmediateDate((o) => !o)} label="Immediately Set Dates" />

        <Button onPress={() => newBatch().then()}>New Batch</Button>
        <Text>loading: {String(loading)}</Text>
        <Text>ingesting: {String(ingesting)}</Text>
        <Text>{JSON.stringify({ currentCards }, null, 2)}</Text>
      </DebugModal>
      {editingImg && <DateSetter img={editingImg} setImg={setEditingImage} />}
    </>
  );
}
