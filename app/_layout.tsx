import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Handle auth state changes - always call this hook
  useEffect(() => {
    if (!context) return;

    const { isAuthenticated, loading } = context;
    if (loading || isAuthenticated === undefined) return;

    // Add this check to prevent unnecessary redirects
    const inCorrectRoute = isAuthenticated
      ? segments[0] === "(tabs)"
      : segments[0] === "login";

    if (inCorrectRoute) return;

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

  useEffect(() => {
    // Reset animation value before starting
    pulseAnim.setValue(1);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: Platform.OS === "web" ? false : true, // Disable native driver for web
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS === "web" ? false : true,
        }),
      ])
    );

    animationRef.current = animation;
    animation.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        pulseAnim.setValue(1);
      }
    };
  }, []); // Empty dependency array

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
        <Animated.Image
          source={require("../assets/images/name.png")}
          style={[
            {
              width: 200,
              height: 200,
            },
            Platform.OS === "web"
              ? {
                  opacity: pulseAnim,
                  transform: [{ scale: pulseAnim }],
                }
              : {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0.6, 1],
                        outputRange: [0.8, 1],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
          ]}
          resizeMode="contain"
        />
        {Platform.OS === "web" && (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}
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
