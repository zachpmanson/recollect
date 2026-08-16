import { ImageStatus } from "@/db/images";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AllowedPanDirection, SwipeableCardStack, SwipeDirection } from "react-native-swipeable-card-stack";
import { TText } from "../ThemedText";
import { ActionButton } from "../ui/ActionButton";
import ThemedCircularProgress from "../ui/CircularProgress";
import { IconSymbol } from "../ui/IconSymbol";
import { Load } from "../ui/LoadingSpinner";
import Card from "./Card";
import { ImageWithPosition } from "./StackManager";

const directions = ["left", "right", "top"];
const directionResult: { [k in (typeof directions)[number]]: ImageStatus } = {
  left: "deleted",
  right: "accepted",
  top: "rejected",
};

export default function CardStack({
  cards,
  setStatus,
  getNewBatch,
  canUndo = false,
  onUndo,
  isLoading = false,
}: {
  cards: ImageWithPosition[];
  setStatus: (img: ImageWithPosition, status: ImageStatus) => void;
  getNewBatch: (resetDay?: boolean) => void;
  canUndo?: boolean;
  onUndo?: () => Promise<boolean>;
  isLoading?: boolean;
}) {
  const [swipes, setSwipes] = useState<SwipeDirection[]>([]); // First card already swiped right

  const { bottom } = useSafeAreaInsets();

  const card = cards[swipes.length];

  useEffect(() => {
    if (cards.length === 0 || isLoading) {
      setSwipes([]);
    }
  }, [cards, setSwipes, isLoading]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}>
        <Load isLoading={isLoading || cards.length === 0}>
          <SwipeableCardStack<ImageWithPosition>
            data={cards}
            swipes={swipes}
            renderCard={renderCard}
            keyExtractor={(item) => String(item.id)}
            allowedPanDirections={directions as AllowedPanDirection[]}
            allowedSwipeDirections={directions as AllowedPanDirection[]}
            onSwipeEnded={(img, direction) => {
              setSwipes((o) => [...o, direction]);
              setStatus(img, directionResult[direction]);
            }}
            style={styles.stack}
          />
        </Load>
        {cards.length === 0 && <TText>No images to display. Please add some images to your collection.</TText>}
      </View>
      <View style={{ justifyContent: "center", flexDirection: "row" }}>
        <ThemedCircularProgress size={20} width={5} perc={isLoading ? 100 : (swipes.length / cards.length) * 100} />
      </View>
      <View style={styles.actionButtonsContainer}>
        <ActionButton
          style={{ backgroundColor: "red" }}
          disabled={cards.length === swipes.length}
          onPress={() => {
            setSwipes((current) => [...current, "left"]);
            setStatus(card, "rejected");
          }}
        >
          <IconSymbol name="clear" color="white" />
        </ActionButton>
        <ActionButton
          disabled={!canUndo}
          onPress={async () => {
            // Undo the most recent decision. If the image is still in the
            // current batch, pop the swipe so the card slides back; if it
            // belonged to a previous batch, the parent reloads the stack
            // with the image restored as the top card.
            const wasInBatch = await onUndo?.();
            if (wasInBatch) {
              setSwipes((prev) => prev.slice(0, -1));
            }
          }}
        >
          <IconSymbol name="undo" color="black" />
        </ActionButton>
        <ActionButton
          onPress={() => {
            getNewBatch(true);
            setSwipes([]);
          }}
          disabled={cards.length === swipes.length}
        >
          <IconSymbol name="repeat" color={"black"} />
        </ActionButton>

        <ActionButton
          style={{ backgroundColor: "lightgreen" }}
          onPress={() => {
            setSwipes((current) => [...current, "right"]);
            setStatus(card, "accepted");
          }}
        >
          <IconSymbol name="check" color="white" />
        </ActionButton>
      </View>
    </View>
  );
}

const renderCard = (props: any) => <Card {...props} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "red",
  },
  stack: {
    // padding: 16,
    // paddingTop: 64,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    // paddingHorizontal: 16,
    justifyContent: "space-between",
    gap: 16,
  },
});
