import { ImageModel } from "@/db/images";
import useDb from "@/db/useDb";
import { getFileModDate } from "@/utils/files";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button } from "@react-navigation/elements";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { TText } from "./ThemedText";
import BottomModal from "./ui/BottomModal";

export default function DateSetter({ img, setImg }: { img: ImageModel; setImg: (id: ImageModel | undefined) => void }) {
  const db = useDb();
  const [ogDate, setOgDate] = useState<Dayjs>();
  const [selected, setSelected] = useState<Date>(new Date());
  const day = dayjs(selected);
  const [showPicker, setShowPicker] = useState(true);
  const mode = "date";

  const filename = img?.original_path.split("/").at(-1);

  function update(status: "draft" | "updated") {
    db.repositories.image.setNewDate(img.id, day, status).then(() => {
      setImg(undefined);
    });
  }

  useEffect(() => {
    if (img) {
      getFileModDate(img.original_path).then((date) => {
        setOgDate(date);
      });
    }
  }, [img]);

  return (
    <BottomModal open={!!img} setOpen={() => setImg(undefined)}>
      <View style={{ flex: 1, padding: 16 }}>
        <TText>Update: {filename}</TText>
        {showPicker && (
          <DateTimePicker
            value={selected}
            mode={mode}
            onChange={(_, v) => {
              if (v) {
                setSelected(v);
                setShowPicker(false);
              }
            }}
          />
        )}
        {/* <TText>Old date: {img.original_date?.format("DD MMM YYYY") ?? "No date"}</TText> */}
        {/* <TText>Old date: {img.original_date?.format("DD MMM YYYY")}</TText> */}
        <TText>Old date: {ogDate?.format("DD MMM YYYY")}</TText>
        <TText>New date: {day?.format("DD MMM YYYY")}</TText>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <Button color="grey" onPress={() => setImg(undefined)}>
            Close
          </Button>

          <Button onPress={() => setShowPicker(true)}>Edit</Button>
          <Button color="blue" onPressIn={() => update("draft")}>
            Draft
          </Button>
          <Button color="blue" onPressIn={() => update("updated")}>
            Save
          </Button>
        </View>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({});
