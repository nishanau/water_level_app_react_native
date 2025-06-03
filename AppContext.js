import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "./services/authService";
import notificationService from "./services/notificationService";
import orderService from "./services/orderService";
import tankService from "./services/tankService";

// Create context
const AppContext = createContext();

// Context provider component
export function AppProvider({ children }) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App state
  const [waterLevel, setWaterLevel] = useState(50);
  const [tankSize, setTankSize] = useState(0);
  const [avgDailyUsage, setAvgDailyUsage] = useState(0);
  const [nextDelivery, setNextDelivery] = useState(null);
  const [autoOrder, setAutoOrder] = useState(false);
  const [lowWaterThreshold, setLowWaterThreshold] = useState(20);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    push: true,
    sms: false,
    email: true,
  });

  // Check authentication status on app start
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);
  // Authentication methods
  const checkAuth = async () => {
    try {
      const { token, user } = await authService.checkAuth();

      if (token && user) {
        setUser(user);
        setIsAuthenticated(true);
        console.log("Loading user data...", user);
        await loadUserData();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      // await loadUserData();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    resetAppState();
  };

  const resetAppState = () => {
    setWaterLevel(0);
    setTankSize(0);
    setAvgDailyUsage(0);
    setNextDelivery(null);
    setAutoOrder(false);
    setNotifications([]);
    setOrders([]);
  };

  // Load user's data from API
  const loadUserData = async () => {
    try {
      console.log("Loading user data in loading method...", user);
      console.log("tankIds:", user.tankIds[0]);
      const tank = await tankService.getTankData(user.tankIds[0]);
      setTankSize(tank.capacity);
      //  setWaterLevel(tank.currentLevel);
      setAvgDailyUsage(tank.avgDailyUsage);
      setAutoOrder(tank.autoOrder);
      setLowWaterThreshold(tank.lowWaterThreshold);

      const orders = await orderService.getOrders();
      setOrders(orders);

      const notifications = await notificationService.getNotifications();
      setNotifications(notifications);
      console.log("Notification Preferences:", user.notificationPreferences);
      setNotificationPreferences(
        user.notificationPreferences || {
          push: true,
          sms: false,
          email: true,
        }
      );
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  // API methods
  const saveSettings = async (settings) => {
    try {
      await tankService.saveTankSettings(settings);
      await loadUserData();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const placeOrder = async () => {
    try {
      const order = await orderService.placeOrder();
      await loadUserData();
      return order;
    } catch (error) {
      console.error("Failed to place order:", error);
      throw error;
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      await loadUserData();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Auth state
        isAuthenticated,
        user,
        loading,
        login,
        logout,

        // App state
        waterLevel,
        tankSize,
        avgDailyUsage,
        nextDelivery,
        autoOrder,
        lowWaterThreshold,
        notifications,
        orders,
        notificationPreferences,

        // Methods
        saveSettings,
        placeOrder,
        cancelOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    console.warn("useAppContext must be used within an AppProvider");
  }
  return context;
};
