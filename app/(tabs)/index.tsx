import StackManager from "@/components/cards/StackManager";
import { ThemedView } from "@/components/ThemedView";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function ImagesScreen() {
  return (
    <>
      <GestureHandlerRootView>
        <ThemedView style={{ flex: 1, padding: 20, minHeight: 700 }}>
          <StackManager />
        </ThemedView>
      </GestureHandlerRootView>
    </>
  );
}
