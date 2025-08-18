import { ImageModel } from "@/db/images";
import useDb from "@/db/useDb";
import { Button } from "@react-navigation/elements";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { TText } from "./ThemedText";

export default function DatePopulated() {
  const db = useDb();
  const isFocused = useIsFocused();
  const [confirmed, setConfirmed] = useState<ImageModel[]>([]);
  const [count, setCount] = useState(0);

  async function setup() {
    try {
      const result = await db.db.getAllAsync<ImageModel>(
        "SELECT * FROM images WHERE original_date IS NOT NULL ORDER BY updated_on DESC LIMIT 15;"
      );
      setConfirmed(result);

      const totalCount = await db.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM images WHERE original_date IS NOT NULL;"
      );
      setCount(totalCount?.count ?? 0);
    } catch (error) {
      console.error("Error fetching images with original dates:", error);
    }
  }

  useEffect(() => {
    setup().then();
  }, [isFocused]);

  function clearDb() {}
  async function deleteItem(id: number) {
    await db.repositories.image.setStatus(id, "pending");
    // await db.run(`DELETE FROM images WHERE id = ?;`, id);
    await setup();
  }

  return (
    <View style={{ gap: 4 }}>
      <View>
        <TText type="subtitle">dated ({count})</TText>
      </View>
      <View style={{ flexDirection: "row", gap: 4, justifyContent: "flex-end" }}>
        <Button onPress={() => setup().then()}>Refresh</Button>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {confirmed.map((item, index) => (
          <View key={index}>
            <ImageSquare item={item} deleteItem={deleteItem} />
          </View>
        ))}
      </View>
    </View>
  );
}

function ImageSquare({ item, deleteItem }: { item: ImageModel; deleteItem: (id: number) => Promise<void> }) {
  const db = useDb();

  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity key={item.id} onPress={() => deleteItem(item.id).then()} onLongPress={() => setOpen(true)}>
        <Image style={{ minWidth: "25%", aspectRatio: 1 }} source={item.original_path} contentFit="cover" />
        <Modal
          visible={open}
          animationType="slide"
          style={{ backgroundColor: "white", alignItems: "stretch", justifyContent: "space-between", padding: 8 }}
        >
          <Text>{`${JSON.stringify(item, null, 2)}`}</Text>
          <Image
            style={{ width: "100%", minHeight: 100, flexGrow: 1 }}
            source={item.original_path}
            contentFit="contain"
          />

          <Button onPress={() => setOpen(false)}>Close</Button>
        </Modal>
      </TouchableOpacity>
    </>
  );
}
