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
  const [selectedTank, setSelectedTank] = useState(tanks[0]?._id || null);

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
      console.log("Checking authentication status...");
      setLoading(true);
      const { token, user } = await authService.checkAuth();

      if (token && user && isMounted.current) {
        console.log("User is authenticated:", user);
        setUser(user);
        setIsAuthenticated(true);
      } else if (isMounted.current) {
        console.log("User is not authenticated");
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
      setLoading(false); // Load user data if authenticated
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

      const [ orders, suppliers, notification] =
        await Promise.all([

          orderService.getOrders({ signal }),

          supplierService.getSuppliers({ signal }),

          notificationService.getNotifications({ signal }),
        ]);

      // Only update state if component is still mounted
      if (isMounted.current) {
        console.log(
          "User data loaded successfully",
          user.notificationPreferences
        );
        setTanks(user.tanks || []);
        setSelectedTank(user.tanks[0]?._id || null);
        setNotifications(notification || []);
        setTankSize(user.tanks[0].capacity || 0);
        setAvgDailyUsage(user.tanks[0].avgDailyUsage || 0);
        setAutoOrder(user.autoOrder);
        setLowWaterThreshold(user.tanks[0].lowWaterThreshold || 20);
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
  useEffect(
    () => {
      loadUserData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send push notification
  const schedulePushNotification = async (title, body) => {
    if (Platform.OS === "web") {
      console.log(
        `A push notification with message "${body}" should be shown in the app.`
      );
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
        await loadUserData();
        setNewNotification(null);
      } catch (error) {
        console.error("Failed to schedule notification:", error);
      }
    };
    createNewNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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


  // Create a memoized context value to prevent unnecessary renders
  const contextValue = {
    // Auth state
    isAuthenticated,
    user,
    loading,
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
    selectedTank,

    // Methods
    setAutoOrder,
    loadUserData,
    setUser,
    checkAuth,
    setTankSize,
    setAvgDailyUsage,
    setLowWaterThreshold,
    setPreferredSupplier,
    setSuppliers,
    setSelectedTank,
    setNewNotification,
    setIsAuthenticated,
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
