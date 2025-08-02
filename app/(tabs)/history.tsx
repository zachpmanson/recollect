import { HelloWave } from "@/components/HelloWave";
import HistoryCategory from "@/components/HistoryCategory";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const db = useSQLiteContext();
  const [version, setVersion] = useState("");
  useEffect(() => {
    async function setup() {
      const result = await db.getFirstAsync<{ "sqlite_version()": string }>("SELECT sqlite_version()");
      if (result) setVersion(result["sqlite_version()"]);
    }
    setup();
  }, []);
  return (
    <GestureHandlerRootView>
      <ScrollView>
        <ThemedView style={{ padding: 8, paddingTop: insets?.top, gap: 12 }}>
          <ThemedView style={{ flexDirection: "row" }}>
            <ThemedText type="title">Backlog</ThemedText>
            <HelloWave />
          </ThemedView>

          <HistoryCategory status="rejected" />
          <HistoryCategory status="deleted" />
          <HistoryCategory status="accepted" />
          <HistoryCategory status="pending" />
        </ThemedView>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
