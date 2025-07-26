import { StyleSheet, View } from "react-native";

import StackManager from "@/components/cards/StackManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImagesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <GestureHandlerRootView>
        <View style={[styles.header, { paddingTop: insets?.top }]}>
          <ThemedText type="title">Recollect</ThemedText>
          <ThemedView style={styles.titleContainer}></ThemedView>
          <ThemedText>This app includes example code to help you get started.</ThemedText>
        </View>
        <View style={{ flex: 1, padding: 20, minHeight: 700, backgroundColor: "white" }}>
          <StackManager />
        </View>
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "grey", padding: 8 },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
