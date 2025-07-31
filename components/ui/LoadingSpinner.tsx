import { useTheme } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { IconSymbol } from "./IconSymbol";

const duration = 2000;
const easing = Easing.bezier(0.25, -0.5, 0.25, 1);

export default function LoadingSpinner() {
  const sv = useSharedValue<number>(0);
  const theme = useTheme();

  useEffect(() => {
    sv.value = withRepeat(withTiming(1, { duration, easing }), 0);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sv.value * 360}deg` }, { rotate: `${sv.value * 360}deg` }],
  }));
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%" }}>
      <Animated.View
        style={[
          animatedStyle,
          {
            width: 100,
            height: 100,
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <IconSymbol name="photo" color={theme.colors.primary} />
      </Animated.View>
    </View>
  );
}

export function Load({ isLoading, children }: { isLoading: boolean; children?: React.ReactNode }) {
  if (!isLoading) return children;
  return <LoadingSpinner />;
}
