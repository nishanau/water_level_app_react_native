import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MOCK_DATA } from './constants';

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  // App state
  const [waterLevel, setWaterLevel] = useState(MOCK_DATA.waterLevel);
  const [tankSize, setTankSize] = useState(MOCK_DATA.tankSize);
  const [avgDailyUsage, setAvgDailyUsage] = useState(MOCK_DATA.avgDailyUsage);  
  const [nextDelivery, setNextDelivery] = useState(MOCK_DATA.nextDelivery);
  const [autoOrder, setAutoOrder] = useState(MOCK_DATA.autoOrder);
  const [lowWaterThreshold, setLowWaterThreshold] = useState(MOCK_DATA.lowWaterThreshold);
  // Using array destructuring to only get the first element (ignoring the setter)
  const [historyData] = useState(MOCK_DATA.historyData);
  const [notifications, setNotifications] = useState(MOCK_DATA.notifications);
  const [orders, setOrders] = useState(MOCK_DATA.orders);
  const [notificationPreferences, setNotificationPreferences] = useState({
    push: true,
    sms: false,
    email: true,
  });
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  });  const [preferredSupplier, setPreferredSupplier] = useState('Aqua Services Inc.');
  const [loading, setLoading] = useState(false);
  
  // Send push notification - wrapped in useCallback to prevent it from changing on every render
  const schedulePushNotification = useCallback(async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null, // immediately
    });
  }, []);
  
  // Place new water order - defined before it's used in useEffect
  const placeOrder = useCallback(async () => {
    setLoading(true);
    try {
      // This would be an API call in a real app
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const date = new Date();
      const deliveryDate = new Date(date);
      deliveryDate.setDate(date.getDate() + 3); // Delivery in 3 days
      
      const newOrder = {
        id: `WO-${Math.floor(Math.random() * 1000) + 6000}`,
        date: date.toISOString(),
        status: 'Scheduled',
        amount: 3000,
        price: 150.00,
        deliveryDate: deliveryDate.toISOString(),
        invoice: `#INV-${Math.floor(Math.random() * 10000)}`
      };
      
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setNextDelivery(deliveryDate.toISOString());
      
      // Add notification
      const newNotification = {
        id: Date.now(),
        type: 'order',
        message: `Order ${newOrder.id} placed`,
        date: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      // Send push notification
      if (notificationPreferences.push) {
        schedulePushNotification(
          'Order Confirmation',
          `Your water order ${newOrder.id} has been placed. Delivery scheduled for ${new Date(deliveryDate).toLocaleDateString()}.`
        );
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error placing order:', error);
      setLoading(false);
      return false;
    }
  }, [notificationPreferences.push, schedulePushNotification]);
  
  // Check if there's a scheduled order
  const hasScheduledOrder = useCallback(() => {
    return orders.some(order => order.status === 'Scheduled' || order.status === 'In Transit');
  }, [orders]);
  
  // Load settings from storage
  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('waterAppSettings');
      if (storedSettings !== null) {
        const settings = JSON.parse(storedSettings);
        setTankSize(settings.tankSize || MOCK_DATA.tankSize);
        setAvgDailyUsage(settings.avgDailyUsage || MOCK_DATA.avgDailyUsage);
        setAutoOrder(settings.autoOrder !== undefined ? settings.autoOrder : MOCK_DATA.autoOrder);
        setLowWaterThreshold(settings.lowWaterThreshold || MOCK_DATA.lowWaterThreshold);
        setNotificationPreferences(settings.notificationPreferences || { push: true, sms: false, email: true });
        setPreferredSupplier(settings.preferredSupplier || 'Aqua Services Inc.');
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };
  
  // Load stored settings on app start
  useEffect(() => {
    loadSettings();
    
    // Simulating water level changes (would be replaced with real API calls)
    const interval = setInterval(() => {
      // Simulate water usage - decrease by 0.1-0.3% randomly every 30 seconds
      const decrease = Math.random() * 0.2 + 0.1;
      setWaterLevel(prevLevel => {
        const newLevel = Math.max(0, prevLevel - decrease);
        
        // If level drops below threshold and auto order is on, create order
        if (newLevel <= lowWaterThreshold && autoOrder && !hasScheduledOrder()) {
          placeOrder();
          
          // Send notification
          schedulePushNotification(
            'Low Water Alert',
            `Water level at ${newLevel.toFixed(1)}%. Auto-order placed.`
          );
        }
        
        return newLevel;
      });
    }, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, [lowWaterThreshold, autoOrder, hasScheduledOrder, placeOrder, schedulePushNotification]);
  
  // Save settings to storage
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('waterAppSettings', JSON.stringify({
        tankSize,
        avgDailyUsage,
        autoOrder,
        lowWaterThreshold,
        notificationPreferences,
        preferredSupplier,
        ...newSettings
      }));
      
      // Update state with new settings
      if (newSettings.tankSize !== undefined) setTankSize(newSettings.tankSize);
      if (newSettings.avgDailyUsage !== undefined) setAvgDailyUsage(newSettings.avgDailyUsage);
      if (newSettings.autoOrder !== undefined) setAutoOrder(newSettings.autoOrder);
      if (newSettings.lowWaterThreshold !== undefined) setLowWaterThreshold(newSettings.lowWaterThreshold);
      if (newSettings.notificationPreferences !== undefined) setNotificationPreferences(newSettings.notificationPreferences);
      if (newSettings.preferredSupplier !== undefined) setPreferredSupplier(newSettings.preferredSupplier);
      
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  };
  
  // Cancel order
  const cancelOrder = async (orderId) => {
    setLoading(true);
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'Cancelled' } 
          : order
      ));
      
      // Add notification
      const newNotification = {
        id: Date.now(),
        type: 'cancel',
        message: `Order ${orderId} cancelled`,
        date: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      // Send push notification
      if (notificationPreferences.push) {
        schedulePushNotification(
          'Order Cancelled',
          `Your water order ${orderId} has been cancelled.`
        );
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      setLoading(false);
      return false;
    }
  };
    // Reschedule order
  const rescheduleOrder = async (orderId, newDate) => {
    // Validate inputs
    if (!orderId || !newDate || !(newDate instanceof Date) || isNaN(newDate.getTime())) {
      console.error('Invalid order ID or date for rescheduling');
      return false;
    }

    setLoading(true);
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the order to make sure it exists before updating
      const orderExists = orders.some(order => order.id === orderId);
      if (!orderExists) {
        console.error(`Order with ID ${orderId} not found`);
        setLoading(false);
        return false;
      }
      
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, deliveryDate: newDate.toISOString() } 
          : order
      ));
      
      // Add notification
      const newNotification = {
        id: Date.now(),
        type: 'reschedule',
        message: `Order ${orderId} rescheduled to ${new Date(newDate).toLocaleDateString()}`,
        date: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      // Send push notification
      if (notificationPreferences.push) {
        schedulePushNotification(
          'Order Rescheduled',
          `Your water delivery for order ${orderId} has been rescheduled to ${new Date(newDate).toLocaleDateString()}.`
        );
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error rescheduling order:', error);
      setLoading(false);
      return false;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (newProfile) => {
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserProfile(prev => ({ ...prev, ...newProfile }));
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };
  
  // Set water level manually (for testing)
  const setWaterLevelManually = (level) => {
    setWaterLevel(Math.max(0, Math.min(100, level)));
  };
  
  return (
    <AppContext.Provider value={{
      waterLevel,
      tankSize,
      avgDailyUsage,
      nextDelivery,
      autoOrder,
      lowWaterThreshold,
      historyData,
      notifications,
      orders,
      notificationPreferences,
      userProfile,
      preferredSupplier,
      loading,
      setAutoOrder,
      saveSettings,
      placeOrder,
      cancelOrder,
      rescheduleOrder,
      updateUserProfile,
      setWaterLevelManually,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export const useAppContext = () => useContext(AppContext);
