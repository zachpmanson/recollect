import { ImageModel } from "@/db/images";
import useDb from "@/db/useDb";
import { Button } from "@react-navigation/elements";
import { Image } from "expo-image";
import { deleteDatabaseAsync } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Todo() {
  const db = useDb();
  const [confirmed, setConfirmed] = useState<ImageModel[]>([]);

  async function setup() {
    const result = await db.db.getAllAsync<ImageModel>("SELECT * FROM images WHERE status != 'pending' LIMIT 5");
    setConfirmed(result);
  }

  async function deleteTodo(id: number) {
    await db.run(`DELETE FROM images WHERE id = ?;`, id);
    await setup();
  }

  useEffect(() => {
    setup().then();
  }, []);

  function clearDb() {
    deleteDatabaseAsync("recollect.db").then();
  }

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Button onPress={() => clearDb()}>Reset DB?</Button>
        <Button onPress={() => setup().then()}>Refresh</Button>
      </View>
      {confirmed.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => deleteTodo(item.id).then()}>
          <Text>{`${JSON.stringify(item, null, 2)}`}</Text>
          <View>
            <Image style={{ width: 300, height: 100 }} source={item.original_path} contentFit="contain" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
