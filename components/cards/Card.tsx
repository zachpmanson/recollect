import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CardProps } from "react-native-swipeable-card-stack";
import { CardOverlay } from "./CardOverlay";

export type CardItem = {
  id: string;
  title: string;
  file: string;
};

async function getFileInfo(file: string) {
  try {
    const info = await FileSystem.getInfoAsync(file);
    const modificationTime = info.modificationTime;
    return info;
  } catch (error) {
    console.error("Error getting file info:", error);
    return [];
  }
}
function UnmemoisedCard({ xAnimatedPosition, yAnimatedPosition, ...item }: CardProps<CardItem>) {
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    if (item.file) {
      getFileInfo(item.file).then((info) => {
        setMeta(info);
      });
    }
  }, [item.file]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Image source={item.file} style={styles.image} contentFit="contain" />
      </View>

      <View
        style={{
          alignItems: "center",
        }}
      >
        <Text>
          Allegedly:{" "}
          <Text style={styles.text}>
            {meta &&
              new Date(meta?.modificationTime * 1000).toLocaleDateString("en-au", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
          </Text>
        </Text>
        <Text>{item.title}</Text>
        {/* <Text style={styles.text}>{meta && JSON.stringify(meta)}</Text> */}
        {/* <Text style={styles.text}>{meta && meta?.modificationTime * 1000}</Text> */}

        {/* <Text style={{ textAlign: "center" }}>{item.file}</Text> */}

        <CardOverlay xAnimatedPosition={xAnimatedPosition} yAnimatedPosition={yAnimatedPosition} />
      </View>
    </View>
  );
}

const Card = memo(UnmemoisedCard);
export default Card;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // minHeight: 400,
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#00000088",
    overflow: "hidden",
  },
  image: {
    flex: 1,
    width: "100%",
  },
  text: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
    padding: 16,
    color: "black",
  },
});
