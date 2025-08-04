import { theme } from "@/constants/Colors";
import { migrateDbIfNeeded } from "@/db/migrate";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
  // deleteDatabaseAsync("recollect.db").then();

  return (
    <ThemeProvider value={theme}>
      <SQLiteProvider databaseName="recollect.db" onInit={migrateDbIfNeeded}>
        {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
