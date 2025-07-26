import { ActivityIndicator, View } from "react-native";

export default function LoadingSpinner() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

export function Load({ isLoading, children }: { isLoading: boolean; children?: React.ReactNode }) {
  if (!isLoading) return children;
  return <LoadingSpinner />;
}
