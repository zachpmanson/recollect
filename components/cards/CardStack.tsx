import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AllowedPanDirection, SwipeableCardStack, SwipeDirection } from "react-native-swipeable-card-stack";
import { ActionButton } from "../ui/ActionButton";
import { IconSymbol } from "../ui/IconSymbol";
import Card, { CardItem } from "./Card";
import { CardStatus } from "./StackManager";
const directions = ["left", "right", "top"];
const directionResult: { [k in (typeof directions)[number]]: CardStatus } = {
  left: "deleted",
  right: "accepted",
  top: "rejected",
};
export default function CardStack({
  cards,
  setStatus,
  getNewBatch,
}: {
  cards: CardItem[];
  setStatus: (id: number, status: CardStatus) => void;
  getNewBatch: () => void;
}) {
  const [swipes, setSwipes] = useState<SwipeDirection[]>([]); // First card already swiped right

  const { bottom } = useSafeAreaInsets();

  const currentCard = cards[swipes.length];

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}>
        {/* <LoadingSpinner /> */}

        <SwipeableCardStack<CardItem>
          data={cards}
          swipes={swipes}
          renderCard={renderCard}
          keyExtractor={(item) => item.ukey}
          allowedPanDirections={directions as AllowedPanDirection[]}
          allowedSwipeDirections={directions as AllowedPanDirection[]}
          onSwipeEnded={(card, direction) => {
            setSwipes((o) => [...o, direction]);
            setStatus(card.id, directionResult[direction]);
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
            setStatus(currentCard.id, "rejected");
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
            setStatus(currentCard.id, "accepted");
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
