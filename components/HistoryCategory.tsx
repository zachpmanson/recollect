import { ImageModel, ImageStatus } from "@/db/images";
import useDb from "@/db/useDb";
import { Button } from "@react-navigation/elements";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { deleteDatabaseAsync } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

export default function HistoryCategory({ status }: { status: ImageStatus }) {
  const db = useDb();
  const isFocused = useIsFocused();
  const [confirmed, setConfirmed] = useState<ImageModel[]>([]);

  async function setup() {
    const result = await db.db.getAllAsync<ImageModel>(
      "SELECT * FROM images WHERE status = ? ORDER BY updated_on DESC LIMIT 15;",
      status
    );
    setConfirmed(result);
  }

  useEffect(() => {
    setup().then();
  }, [isFocused]);

  function clearDb() {
    deleteDatabaseAsync("recollect.db").then();
  }
  async function deleteItem(id: number) {
    await db.repositories.image.setStatus(id, "pending");
    // await db.run(`DELETE FROM images WHERE id = ?;`, id);
    await setup();
  }

  return (
    <View style={{ gap: 4 }}>
      <View>
        <ThemedText type="subtitle">{status}</ThemedText>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Button onPress={() => clearDb()}>Reset DB?</Button>
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
