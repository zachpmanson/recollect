import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native";

export const ActionButton = ({
  children,
  onPress,
  style,

  ...props
}: {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
} & TouchableOpacityProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.container, style]} {...props}>
    {typeof children === "string" ? <Text style={styles.text}>{children}</Text> : children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 100,
    maxWidth: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 6,
    borderRadius: "100%",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(35, 35, 35, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
  },
  text: {
    fontSize: 28,
  },
});
