import { Switch, SwitchChangeEvent, Text, View } from "react-native";

export default function TSwitch({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (value: SwitchChangeEvent) => void;
  label?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }}>
      <Text>{label}</Text>
      <Switch value={value} onChange={onChange} />
    </View>
  );
}
