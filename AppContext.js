import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Platform } from "react-native";
import authService from "./services/authService";
import notificationService from "./services/notificationService";
import orderService from "./services/orderService";
import supplierService from "./services/supplierService";
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
  const [newNotification, setNewNotification] = useState(null);
  // State for orders, notification preferences, preferred supplier, suppliers, and tanks
  const [orders, setOrders] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    push: true,
    sms: false,
    email: true,
  });
  const [preferredSupplier, setPreferredSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [tanks, setTanks] = useState([]);

  //states to track placing and cancelling orders
  const [placedOrder, setPlacedOrder] = useState(false);
  const [cancelledOrder, setCancelledOrder] = useState(false);

  // Refs to handle race conditions
  const isMounted = useRef(true);
  const loadingUserData = useRef(false);
  const abortController = useRef(new AbortController());

  // Clean up on unmount
  useEffect(() => {
    // Cleanup function when component unmounts
    return () => {
      isMounted.current = false;
      abortController.current.abort();
    };
  }, []);

  useEffect(() => {
    // Call the non-memoized checkAuth function
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (loadingUserData.current) return;

    try {
      setLoading(true);
      const { token, user } = await authService.checkAuth();

      if (token && user && isMounted.current) {
        setUser(user);
        setIsAuthenticated(true);
      } else if (isMounted.current) {
        // Explicitly set unauthenticated state
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Fallback to unauthenticated state on error
      if (isMounted.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status on app start

  const loadUserData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loadingUserData.current || !user) return;

    loadingUserData.current = true;

    try {
      // Create new abort controller for this request cycle
      abortController.current = new AbortController();
      const signal = abortController.current.signal;

      const [tanks, orders, suppliers, notification] = await Promise.all([
        tankService.getTankData(user.tankIds[0], { signal }),

        orderService.getOrders({ signal }),

        supplierService.getSuppliers({ signal }),

        notificationService.getNotifications({ signal }),
      ]);

      // Only update state if component is still mounted
      if (isMounted.current) {
        setTanks(tanks || []);
        setNotifications(notification || []);
        setTankSize(tanks.capacity || 0);
        setAvgDailyUsage(tanks.avgDailyUsage || 0);
        setAutoOrder(user.autoOrder);
        setLowWaterThreshold(tanks.lowWaterThreshold || 20);
        setOrders(orders || []);
        setPreferredSupplier(user.preferredSupplier || "");
        setSuppliers(suppliers || []);
        setNotificationPreferences(
          user.notificationPreferences || {
            push: true,
            sms: false,
            email: true,
          }
        );
      }
    } catch (error) {
      // Don't report errors from intentional cancellations
      if (error.name !== "AbortError") {
        console.error("Failed to load user data:", error);
        Alert.alert(
          "Data Error",
          "There was a problem loading your data. Please try again later."
        );
      }
    } finally {
      loadingUserData.current = false;
    }
  }, [user]);

  // Load user data when user changes
  useEffect(() => {
    if (user || placedOrder || cancelledOrder) {
      if (placedOrder) {
        setPlacedOrder(false);
        loadUserData();
        return;
      }
      if (cancelledOrder) {
        setCancelledOrder(false);
        loadUserData();
        return;
      }
      loadUserData();
    }
  }, [user, placedOrder, cancelledOrder]);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (isMounted.current) {
        setUser(response.user);
        setIsAuthenticated(true);

        const newNoti = {
          userId: response.user.id,
          type: "system",
          message: `Welcome back, ${response.user.firstName}!`,
          relatedTo: "users",
          read: false,
          sentVia: ["push"],
        };
        setNewNotification(newNoti);
      }
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      Alert.alert("Login Error", errorMessage);
      throw error;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      // Cancel any pending requests
      abortController.current.abort();
      abortController.current = new AbortController();

      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (isMounted.current) {
        setUser(null);
        setIsAuthenticated(false);
        resetAppState();
        setLoading(false);
      }
    }
  }, []);

  // Send push notification
  const schedulePushNotification = async (title, body) => {
    if (Platform.OS === "web") {
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null, // immediately
    });
  };

  useEffect(() => {
    if (!newNotification) return;
    const createNewNotification = async () => {
      try {
        if (notificationPreferences.push) {
          schedulePushNotification(newNotification.title, newNotification.body);
        }
        await notificationService.createNotification(newNotification);

        setNotifications((prev) => [newNotification, ...prev]);
        setNewNotification(null);
        console.log("Notification created successfully");
      } catch (error) {
        console.error("Failed to schedule notification:", error);
      }
    };
    createNewNotification();
  }, [newNotification]);

  const resetAppState = useCallback(() => {
    setWaterLevel(0);
    setTankSize(0);
    setAvgDailyUsage(0);
    setNextDelivery(null);
    setAutoOrder(false);
    setNotifications([]);
    setOrders([]);
  }, []);

  const placeOrder = useCallback(
    async (orderData) => {
      try {
        const order = await orderService.placeOrder(orderData);
        setPlacedOrder(true);
        const newNoti = {
          userId: user.id,
          type: "order",
          message: `Order placed successfully!`,
          relatedTo: "order",
          read: false,
          sentVia: ["push"],
        };
        setNewNotification(newNoti);
        console.log("Order placed successfully");
        return order;
      } catch (error) {
        console.error("Failed to place order:", error);
        Alert.alert(
          "Error",
          "Failed to place your order. Please try again later."
        );
        throw error;
      }
    },
    [loadUserData]
  );

  const cancelOrder = useCallback(
    async (orderId) => {
      try {
        await orderService.cancelOrder(orderId);
        setCancelledOrder(true);
        const newNoti = {
          userId: user.id,
          type: "order",
          message: `Order cancelled successfully!`,
          relatedTo: "order",
          read: false,
          sentVia: ["push"],
        };
        setNewNotification(newNoti);
        console.log("Order cancelled successfully");
        return true;
      } catch (error) {
        console.error("Failed to cancel order:", error);
        Alert.alert(
          "Cancel Error",
          "Failed to cancel your order. Please try again later."
        );
        return false;
      }
    },
    [loadUserData]
  );

  // Refresh user data on demand
  const refreshUserData = useCallback(async () => {
    if (user && !loadingUserData.current) {
      await loadUserData();
      return true;
    }
    return false;
  }, [user, loadUserData]);

  // Create a memoized context value to prevent unnecessary renders
  const contextValue = {
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
    preferredSupplier,
    suppliers,
    tanks,

    // Methods
    setAutoOrder,
    placeOrder,
    cancelOrder,
    refreshUserData,
    loadUserData,
    setUser,
    checkAuth,
    setTankSize,
    setAvgDailyUsage,
    setLowWaterThreshold,
    setPreferredSupplier,
    setSuppliers,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
