import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwipeableCardStack, SwipeDirection } from "react-native-swipeable-card-stack";
import LoadingSpinner from "../LoadingSpinner";
import { ActionButton } from "../ui/ActionButton";
import Card, { CardItem } from "./Card";
const defaultCards: CardItem[] = [
  // { id: "1", title: "Swipe me!", file: "" },
  // { id: "2", title: "Next card", file: "" },
  // { id: "3", title: "Last one", file: "" },
];
export const FOLDER = "file:///storage/emulated/0/DCIM/Camera/";

async function getFiles() {
  try {
    const files = await FileSystem.readDirectoryAsync(FOLDER);
    return files;
  } catch (error) {
    return [];
  }
}

export default function CardStack() {
  const [n, setN] = useState(0);
  const [swipes, setSwipes] = useState<SwipeDirection[]>([]); // First card already swiped right
  const { bottom } = useSafeAreaInsets();

  const [cards, setCards] = useState<CardItem[]>(defaultCards);
  const [allImages, setAllImages] = useState<string[]>([]);

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  async function reqPerms() {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }

    const files = await getFiles();
    setAllImages(files);
    return files;
  }

  async function loadImage() {
    const file = allImages[Math.floor(Math.random() * allImages.length)];
    console.log(`Adding card with file:`, file);
    if (file) {
      setCards((o) => {
        const n = o;
        // if (n.length >= 10) {
        //   n.shift();
        // }
        return [
          ...n,
          {
            id: `Card ${n} ${file}`,
            title: `${file}`,
            file: `${FOLDER}${file}`,
          },
        ];
      });

      setN((o) => o + 1);
    }
  }

  useEffect(() => {
    reqPerms().then();
  }, []);

  useEffect(() => {
    loadImage().then();
  }, [swipes]);

  useEffect(() => {
    if (allImages.length !== 0) {
      loadImage().then();
      loadImage().then();
      loadImage().then();
      loadImage().then();
      loadImage().then();
      loadImage().then();
    }
  }, [allImages]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}>
        {cards.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <SwipeableCardStack<CardItem>
            data={cards}
            swipes={swipes}
            renderCard={renderCard}
            keyExtractor={(item) => item.id}
            allowedPanDirections={["left", "right"]}
            allowedSwipeDirections={["left", "right"]}
            onSwipeEnded={(_, direction) =>
              setSwipes((o) => {
                const n = o;
                // if (n.length >= 10) {
                //   n.shift();
                // }
                return [...n, direction];
              })
            }
            style={styles.stack}
          />
        )}
      </View>
      <Text style={{ textAlign: "center", marginBottom: 16 }}>
        n_cards: {cards.length} swipes: {swipes.length}
      </Text>
      <View style={styles.actionButtonsContainer}>
        <ActionButton
          onPress={() => {
            setSwipes((current) => [...current, "left"]);
          }}
        >
          ⬅️
        </ActionButton>
        <ActionButton
          onPress={() => {
            reqPerms();
            setSwipes((current) => []);
          }}
        >
          💥
        </ActionButton>

        <ActionButton
          onPress={() => {
            setSwipes((current) => [...current, "right"]);
          }}
        >
          ➡️
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
