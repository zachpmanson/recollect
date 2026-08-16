import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DebugModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return (
    <>
      <Button
        // color="white"
        onPress={() => setOpen(true)}
        style={{ width: 100, position: "absolute", top: insets.top, right: 0 }}
      >
        Debug
      </Button>
      <Modal visible={open} animationType="slide" style={{ backgroundColor: "white", alignItems: "stretch" }}>
        <ScrollView style={{ padding: 8 }}>{children}</ScrollView>

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}></View>
        <Button onPress={() => setOpen(false)} style={{ width: 100, margin: 20 }}>
          Close
        </Button>
      </Modal>
    </>
  );
}
