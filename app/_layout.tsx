import { AuthProvider } from "@/context/authContext";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import Toast from "react-native-toast-message";
import { Platform } from "react-native";

export const Barlow = {
  regular: "Barlow-Regular",
  medium: "Barlow-Medium",
  semiBold: "Barlow-SemiBold",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Barlow-Regular": require("../assets/fonts/Barlow-Regular.ttf"),
    "Barlow-Medium": require("../assets/fonts/Barlow-Medium.ttf"),
    "Barlow-SemiBold": require("../assets/fonts/Barlow-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (Platform.OS === "web") {
    require("../global-styles.css");
  }

  if (!fontsLoaded) return null;
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
      <Toast />
    </AuthProvider>
  );
}
