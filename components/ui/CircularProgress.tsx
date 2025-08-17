import { useTheme } from "@react-navigation/native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export default function ThemedCircularProgress({ size, width, perc }: { size: number; width: number; perc: number }) {
  const theme = useTheme();
  return (
    <AnimatedCircularProgress
      size={size}
      width={width}
      fill={perc}
      tintColor={theme.colors.primary}
      backgroundColor={theme.colors.background}
      onAnimationComplete={() => console.log("onAnimationComplete")}
      rotation={0}
      duration={200}
    />
  );
}
