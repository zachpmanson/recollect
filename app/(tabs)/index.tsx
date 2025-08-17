import StackManager from "@/components/cards/StackManager";
import { TText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <GestureHandlerRootView>
        <ThemedView style={{ padding: 8, paddingTop: insets?.top }}>
          <TText type="title">Recollect</TText>
          <TText>Organise your photos, day by day.</TText>
        </ThemedView>
        <ThemedView style={{ flex: 1, padding: 20, minHeight: 700 }}>
          <StackManager />
        </ThemedView>
      </GestureHandlerRootView>
    </>
  );
}
