import { useTheme } from "@react-navigation/native";
import { DimensionValue, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

export default function BottomModal({
  open,
  setOpen,
  children,
  height = "40%",
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  height?: DimensionValue;
}) {
  const theme = useTheme();
  return (
    <Modal animationType="slide" transparent visible={open}>
      <View style={{ padding: 8, flex: 1, alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity style={{ flex: 1, width: "100%" }} onPress={() => setOpen(false)}></TouchableOpacity>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.primary,
              borderTopWidth: 2,
              minWidth: height,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    // borderTopRightRadius: 18,
    // borderTopLeftRadius: 18,
    borderRadius: 18,
    flex: 1,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(35, 35, 35, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
  },
});
