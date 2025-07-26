import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CardProps } from "react-native-swipeable-card-stack";
import { CardOverlay } from "./CardOverlay";

export type CardItem = {
  id: number;
  ukey: string;
  title: string;
  file: string;
};

async function getFileInfo(file: string) {
  try {
    const info = await FileSystem.getInfoAsync(file);
    const modificationTime = "modificationTime" in info ? info.modificationTime : "";
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

  const potentialDates = item.file.match(/20\d\d\d\d\d\d/);
  const filenameDate = potentialDates ? potentialDates[0] : null;
  const filenameDateObj = filenameDate
    ? new Date(`${filenameDate.slice(0, 4)}-${filenameDate.slice(4, 6)}-${filenameDate.slice(6, 8)}`)
    : null;

  const filenameDateStr = filenameDateObj?.toLocaleDateString("en-au", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const metaDate = meta?.modificationTime ? new Date(meta.modificationTime * 1000) : null;
  const metaDateStr = metaDate?.toLocaleDateString("en-au", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Image source={item.file} style={styles.image} contentFit="contain" />
      </View>

      <View
        style={{
          alignItems: "stretch",
          paddingHorizontal: 8,
          paddingVertical: 8,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            {metaDate && <Text>Allegedly: </Text>}
            {filenameDateObj && <Text>Filename Indicates:</Text>}
          </View>
          <View>
            <Text style={styles.text}>{metaDateStr}</Text>
            {filenameDateObj && (
              <Text
                style={[
                  styles.text,
                  metaDateStr === filenameDateStr ? { backgroundColor: "lightgreen" } : { backgroundColor: "red" },
                ]}
              >
                {filenameDateStr}
              </Text>
            )}
          </View>
        </View>
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
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(35, 35, 35, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
  },
  image: {
    flex: 1,
    width: "100%",
  },
  text: {
    fontWeight: "600",
    color: "black",
  },
});
