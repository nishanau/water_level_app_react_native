import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Tabs } from "expo-router";
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { AppProvider } from '../AppContext';

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

export default function RootLayout() {
  useEffect(() => {
    // Request notifications permissions
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  return (
    <PaperProvider>
      <AppProvider>
        <Tabs screenOptions={{
          tabBarActiveTintColor: '#0088cc',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: "History",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chart-line" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: "Orders",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="truck-delivery" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cog" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </AppProvider>
    </PaperProvider>
  );
}
