import { ImageModel, ImageStatus } from "@/db/images";
import useDb from "@/db/useDb";
import usePhotoIngest from "@/hooks/usePhotoIngest";
import { Button } from "@react-navigation/elements";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
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
  const [excludeDated, setExcludeDated] = useState(false);
  const [editingImg, setEditingImage] = useState<ImageModel>();

  const [loading, setLoading] = useState(true);

  // Double-buffered batches: the deck being swiped (currentCards) and the
  // next batch prefetched in the background (nextCards). When the current
  // batch is finished, the swap is instant — no loading state.
  const [currentCards, setCurrentCards] = useState<ImageModel[]>([]);
  const [nextCards, setNextCards] = useState<ImageModel[]>([]);
  const [batchKey, setBatchKey] = useState(0);
  const [history, setHistory] = useState<Decision[]>([]);
  // Day of the last loaded batch. With Single Day mode, batches are sticky:
  // each new batch keeps drawing from this day until the repeat button
  // explicitly hops to a fresh random day.
  const [currentDay, setCurrentDay] = useState<Dayjs>();

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
      const images = await loadNImage(10, singleDay, excludeDated, currentDay);
      const rest = images.filter((i) => i.id !== last.img.id);
      setCurrentCards([{ ...last.img, status: "pending" }, ...rest]);
      setNextCards([]);
      setBatchKey((k) => k + 1);
      const anchor = singleDay ? (rest[0]?.original_date ?? undefined) : undefined;
      void prefetchNext(anchor);
    } finally {
      setLoading(false);
    }
    return false;
  }


  useEffect(() => {
    const allStatusSet = currentCards.length > 0 && currentCards.every((c) => c.status !== "pending");
    if (allStatusSet) {
      console.log("All cards have been set");
      if (nextCards.length > 0) {
        // Buffer is ready: swap instantly, no spinner.
        advance();
      } else {
        // Buffer not ready (rare — very fast swiping): spinner fallback.
        newBatch();
      }
    }
  }, [currentCards, nextCards]);

  useEffect(() => {
    // Re-enabling Single Day starts from a fresh random day (the sticky
    // anchor from a previous session/day is no longer meaningful).
    if (singleDay) setCurrentDay(undefined);
  }, [singleDay]);

  /** Prefetch the following batch into the buffer (fail-open). */
  async function prefetchNext(anchor?: Dayjs) {
    try {
      let images = await loadNImage(10, singleDay, excludeDated, anchor);
      // Day exhausted: fall back to a random day rather than buffering an
      // empty deck.
      if (images.length === 0 && anchor) {
        images = await loadNImage(10, singleDay, excludeDated, undefined);
      }
      setNextCards(images);
    } catch (error) {
      console.error("Prefetch failed:", error);
      setNextCards([]);
    }
  }

  /** Swap the buffered batch in as the current deck, then refill the buffer. */
  async function advance() {
    const swapped = nextCards;
    setCurrentCards(swapped);
    setNextCards([]);
    setBatchKey((k) => k + 1);
    if (singleDay) setCurrentDay(swapped[0]?.original_date ?? undefined);
    const anchor = singleDay ? (swapped[0]?.original_date ?? undefined) : undefined;
    await prefetchNext(anchor);
  }

  async function newBatch(resetDay = false) {
    console.log("Getting new batch");
    // Sticky Single Day: anchor on the current day unless the repeat button
    // asks for a fresh random day.
    const anchor = resetDay ? undefined : currentDay;
    if (resetDay) setCurrentDay(undefined);
    setLoading(true);
    let images = await loadNImage(10, singleDay, excludeDated, anchor);
    // The day is exhausted: fall back to a random day rather than showing an
    // empty stack.
    if (images.length === 0 && anchor) {
      images = await loadNImage(10, singleDay, excludeDated, undefined);
    }
    setCurrentCards(images);
    setNextCards([]);
    setBatchKey((k) => k + 1);
    if (singleDay) setCurrentDay(images[0]?.original_date ?? undefined);
    setLoading(false);
    const nextAnchor = singleDay ? (images[0]?.original_date ?? undefined) : undefined;
    void prefetchNext(nextAnchor);
  }

  const lastAutoLoad = useRef(0);
  useEffect(() => {
    console.log("ingesting:", ingesting);
    // Kick off the first batch (or reload once ingest has finished). Throttled
    // so an empty DB can't spin a load → empty → load loop.
    if (!ingesting && currentCards.length === 0 && Date.now() - lastAutoLoad.current > 2000) {
      lastAutoLoad.current = Date.now();
      if (nextCards.length > 0) {
        advance();
      } else {
        newBatch();
      }
    }
  }, [ingesting, currentCards, nextCards]);

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
          batchKey={batchKey}
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
        <TSwitch value={excludeDated} onChange={() => setExcludeDated((o) => !o)} label="Exclude Already-Dated (name = mod date)" />

        <Button onPress={() => newBatch(true).then()}>New Random Day</Button>
        <Text>loading: {String(loading)}</Text>
        <Text>ingesting: {String(ingesting)}</Text>
        <Text>day: {currentDay?.format("DD MMM YYYY") ?? "—"}</Text>
        <Text>{JSON.stringify({ currentCards }, null, 2)}</Text>
      </DebugModal>
      {editingImg && <DateSetter img={editingImg} setImg={setEditingImage} />}
    </>
  );
}
