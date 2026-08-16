import StackManager from "@/components/cards/StackManager";
import { ThemedView } from "@/components/ThemedView";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <GestureHandlerRootView>
        <ThemedView style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20, paddingTop: insets.top, minHeight: 700 }}>
          <StackManager />
        </ThemedView>
      </GestureHandlerRootView>
    </>
  );
}
