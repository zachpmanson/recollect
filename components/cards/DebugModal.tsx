import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Modal, ScrollView, View } from "react-native";

export default function DebugModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        color="white"
        onPress={() => setOpen(true)}
        style={{ backgroundColor: "red", width: 100, position: "absolute", top: 0, right: 0 }}
      >
        Debug
      </Button>
      <Modal visible={open} animationType="slide" style={{ backgroundColor: "white", alignItems: "stretch" }}>
        <ScrollView style={{ padding: 8 }}>{children}</ScrollView>

        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}></View>
        <Button color="white" onPress={() => setOpen(false)} style={{ backgroundColor: "red", width: 100, margin: 20 }}>
          Close
        </Button>
      </Modal>
    </>
  );
}
