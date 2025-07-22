import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export const ActionButton = ({ children, onPress }: { children: ReactNode; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.container}>
    {typeof children === "string" ? <Text style={styles.text}>{children}</Text> : children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "plum",
    padding: 6,
    borderRadius: "100%",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(35, 35, 35, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
  },
  text: {
    fontSize: 28,
  },
});
