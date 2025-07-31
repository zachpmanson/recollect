import StackManager from "@/components/cards/StackManager";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ImagesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <>
      <GestureHandlerRootView>
        <ThemedView style={{ padding: 8, paddingTop: insets?.top }}>
          <ThemedText type="title">Recollect</ThemedText>
          <ThemedText>This app includes example code to help you get started.</ThemedText>
        </ThemedView>
        <ThemedView style={{ flex: 1, padding: 20, minHeight: 700 }}>
          <StackManager />
        </ThemedView>
      </GestureHandlerRootView>
    </>
  );
}
