import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function AuthGate() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    const ready = navigationState?.key != null;
    if (!ready || !hydrated) return;

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [hydrated, isAuthenticated, navigationState?.key, router, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <AuthGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen
            name="join-group"
            options={{
              gestureDirection: "vertical",
              headerShown: false,
              presentation: "formSheet",
              animation: "slide_from_bottom",
              sheetGrabberVisible: true,
              sheetInitialDetentIndex: 0,
              sheetAllowedDetents: [0.5, 1],
              sheetExpandsWhenScrolledToEdge: true,
              sheetElevation: 24,
            }}
          />
          <Stack.Screen
            name="create-group"
            options={{
              gestureDirection: "vertical",
              headerShown: false,
              presentation: "formSheet",
              animation: "slide_from_bottom",
              sheetGrabberVisible: true,
              sheetInitialDetentIndex: 0,
              sheetAllowedDetents: [0.5, 1],
              sheetExpandsWhenScrolledToEdge: true,
              sheetElevation: 24,
            }}
          />
          <Stack.Screen
            name="create-survey"
            options={{
              gestureDirection: "vertical",
              headerShown: false,
              presentation: "formSheet",
              animation: "slide_from_bottom",
              sheetGrabberVisible: true,
              sheetInitialDetentIndex: 0,
              sheetAllowedDetents: [1],
              sheetExpandsWhenScrolledToEdge: true,
              sheetElevation: 24,
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
