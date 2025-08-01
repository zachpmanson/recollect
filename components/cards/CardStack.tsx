import { ImageStatus } from "@/db/images";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AllowedPanDirection, SwipeableCardStack, SwipeDirection } from "react-native-swipeable-card-stack";
import { ActionButton } from "../ui/ActionButton";
import { IconSymbol } from "../ui/IconSymbol";
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
}: {
  cards: ImageWithPosition[];
  setStatus: (img: ImageWithPosition, status: ImageStatus) => void;
  getNewBatch: () => void;
}) {
  const [swipes, setSwipes] = useState<SwipeDirection[]>([]); // First card already swiped right

  const { bottom } = useSafeAreaInsets();

  const card = cards[swipes.length];

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}>
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
      </View>
      <Text style={{ textAlign: "center", marginBottom: 16 }}>
        {swipes.length + 1}/{cards.length}
      </Text>
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
          onPress={() => {
            // reqPerms();
            setSwipes((prev) => {
              const next = [...prev];
              next.pop(); // Remove the last swipe
              return next;
            });
          }}
        >
          <IconSymbol name="undo" color="black" />
        </ActionButton>
        <ActionButton
          onPress={() => {
            getNewBatch();
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
