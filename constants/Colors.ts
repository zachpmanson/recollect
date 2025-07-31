/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { DarkTheme, Theme } from "@react-navigation/native";

const tintColorDark = "#fff";

const namedColors = {
  pomegranatepurple: "#B90078",
  aconiteviolet: "#9C52F2",
  ochraceoussalmon: "#D99E73",

  eosinepink: "#FF5EC4",
  lightmauve: "#9161F2",
  redviolet: "#3D0079",

  apricot: "#FED0BB",
  melon: "#FCB9B2",
  redwood: "#B23A48",
  cordovan: "#8C2F39",
  chocolatecosmos: "#461220",
};

export const COLORS = {
  light: {
    text: namedColors.chocolatecosmos,
    // background: namedColors.apricot,
    background: "white",
    tint: tintColorDark,
    icon: namedColors.chocolatecosmos,
    tabIconDefault: namedColors.chocolatecosmos,
    tabIconSelected: tintColorDark,
  },
  dark: {
    text: namedColors.chocolatecosmos,
    // background: namedColors.apricot,
    background: "white",
    tint: tintColorDark,
    icon: namedColors.chocolatecosmos,
    tabIconDefault: namedColors.chocolatecosmos,
    tabIconSelected: tintColorDark,
  },
};

export const theme: Theme = {
  dark: true,
  colors: {
    primary: namedColors.chocolatecosmos,
    background: "white",
    // background: namedColors.apricot,
    card: namedColors.redwood,
    text: namedColors.chocolatecosmos,
    border: namedColors.cordovan,
    notification: namedColors.cordovan,
  },
  fonts: DarkTheme.fonts,
};
