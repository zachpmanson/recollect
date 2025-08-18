import { ImageModel } from "@/db/images";
import { dateFromFilename, getFileModDate } from "@/utils/files";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CardProps } from "react-native-swipeable-card-stack";
import { CardOverlay } from "./CardOverlay";

const COLOR = {
  match: "#8BC34A",
  mismatch: "#f48d85ff",
  close: "#FF9800",
};

function UnmemoisedCard({ xAnimatedPosition, yAnimatedPosition, ...item }: CardProps<ImageModel>) {
  const [modDate, setModDate] = useState<dayjs.Dayjs>();

  const filename = item.original_path.split("/").at(-1);

  useEffect(() => {
    if (item.original_path) {
      getFileModDate(item.original_path).then((info) => {
        setModDate(info);
      });
    }
  }, [item.original_path]);

  const nameDate = dateFromFilename(filename);
  const nameDateStr = dateFromFilename(filename)?.format("DD MMM YYYY");
  const metaDateStr = modDate?.format("DD MMM YYYY");

  const matches = modDate?.isSame(nameDate, "day");
  const close = modDate && nameDate && Math.abs(modDate.diff(nameDate, "day")) < 2;
  const color = matches ? "match" : close ? "close" : "mismatch";
  return (
    <View style={[styles.container, { borderColor: COLOR[color] }]}>
      <CardOverlay xAnimatedPosition={xAnimatedPosition} yAnimatedPosition={yAnimatedPosition} />

      <View style={{ flex: 1 }}>
        <Image source={item.original_path} style={styles.image} contentFit="contain" />
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
            {metaDateStr && <Text>Allegedly: </Text>}
            {nameDate && <Text>Filename Indicates:</Text>}
          </View>
          <View>
            <Text style={styles.text}>{metaDateStr}</Text>
            {nameDate && <Text style={[styles.text]}>{nameDateStr}</Text>}
          </View>
        </View>
        <Text>{filename}</Text>

        {/* <Text style={styles.text}>{meta && JSON.stringify(meta)}</Text> */}
        {/* <Text style={styles.text}>{meta && meta?.modificationTime * 1000}</Text> */}

        {/* <Text style={{ textAlign: "center" }}>{item.file}</Text> */}
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
    position: "relative",
    borderRadius: 8,
    borderWidth: 2,
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
