import { StyleSheet } from "react-native";
import { TText } from "./ThemedText";
import BottomModal from "./ui/BottomModal";

export default function DateSetter({
  fileId,
  setFileId,
}: {
  fileId: number;
  setFileId: (id: number | undefined) => void;
}) {
  return (
    <BottomModal open={!!fileId} setOpen={() => setFileId(undefined)}>
      <TText style={{ padding: 16, fontSize: 18 }}>Set Date for File ID: {fileId}</TText>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: "25%",
    width: "100%",
    backgroundColor: "#25292e",
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: "absolute",
    bottom: 0,
  },
});
