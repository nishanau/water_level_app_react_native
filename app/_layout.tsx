import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AppProvider, useAppContext } from "../AppContext";
import { COLORS } from "../constants";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Inner component that uses the context
function RootLayoutNav() {
  // Move all hooks to the top level - no conditional hooks
  const context = useAppContext();

  const segments = useSegments();
  const router = useRouter();

  // Handle auth state changes - always call this hook
  useEffect(() => {
    if (!context) return;

    const { isAuthenticated, loading } = context;
    if (loading || isAuthenticated === undefined) return;

    // Check if user is in an auth route or main app route
    const isAuthRoute = segments[0] === "login" || segments[0] === "register";

    if (isAuthenticated && isAuthRoute) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace("/(tabs)");
    } else if (
      !isAuthenticated &&
      segments[0] !== "login" &&
      segments[0] !== "register"
    ) {
      // Redirect to login if not authenticated and trying to access protected screens
      router.replace("/login");
    }
  }, [context, segments, router]);

  // Render based on loading state - no conditional hooks
  if (!context || context.loading || context.isAuthenticated === undefined) {

    
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Wrap the layout with the AppProvider
export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}
