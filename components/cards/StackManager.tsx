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

/** A committed decision, kept so undo can revert it (even across batches). */
interface Decision {
  img: ImageModel;
  status: ImageStatus;
}

const MAX_HISTORY = 50;

/** Marshalls card blocks */
export default function StackManager() {
  const db = useDb();

  const { loadNImage, ingesting } = usePhotoIngest();
  const [singleDay, setSingleDay] = useState(true);
  const [immediateDate, setImmediateDate] = useState(false);
  const [editingImg, setEditingImage] = useState<ImageModel>();

  const [loading, setLoading] = useState(false);

  const [currentCards, setCurrentCards] = useState<ImageModel[]>([]);
  const [history, setHistory] = useState<Decision[]>([]);

  function recordDecision(img: ImageModel, status: ImageStatus) {
    setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), { img, status }]);
  }

  function setStatus(img: ImageWithPosition, status: ImageStatus) {
    recordDecision(img, status);
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

  /**
   * Undo the most recent decision — reverts the DB row to `pending` even when
   * the decision was made in a previous batch.
   * @returns true when a decision was undone and the image is still in the
   *          current batch (caller should pop the swipe visual); false for
   *          cross-batch undos (the batch is reloaded with the image restored
   *          as the top card).
   */
  async function undoLast(): Promise<boolean> {
    const last = history[history.length - 1];
    if (!last) return false;
    setHistory((h) => h.slice(0, -1));

    const inBatchIndex = currentCards.findIndex((c) => c.id === last.img.id);
    await db.repositories.image.setStatus(last.img.id, "pending");

    if (inBatchIndex !== -1) {
      // Still in the current batch: flip it back to pending; the caller pops
      // the swipe so the card slides back into the stack.
      setCurrentCards((prev) => {
        const next = [...prev];
        next[inBatchIndex] = { ...next[inBatchIndex], status: "pending" };
        return next;
      });
      return true;
    }

    // Crossed a batch border: reload the stack with this image as the top card.
    setLoading(true);
    try {
      const images = await loadNImage(10, singleDay);
      const rest = images.filter((i) => i.id !== last.img.id);
      setCurrentCards([{ ...last.img, status: "pending" }, ...rest]);
    } finally {
      setLoading(false);
    }
    return false;
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
          canUndo={history.length > 0}
          onUndo={undoLast}
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
