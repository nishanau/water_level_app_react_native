// Colors
export const COLORS = {
  primary: "#0088cc",
  secondary: "#4c9be8",
  background: "#f5f5f5",
  text: "#333333",
  border: "#dddddd",
  success: "#28a745",
  warning: "#ffc107",
  danger: "#dc3545",
  white: "#ffffff",
  black: "#000000",
  gray: "#888888",
  lightGray: "#eeeeee",
};

// Mock API endpoints (replace with real ones when available)
export const API = {
  waterLevel: "/api/water-level",
  orders: "/api/orders",
  settings: "/api/settings",
  notifications: "/api/notifications",
  placeOrder: "/api/orders/new",
};

// Water level thresholds
export const WATER_LEVELS = {
  critical: 20, // Red zone below 20%
  warning: 40, // Yellow zone between 20% and 40%
  safe: 100, // Green zone above 40%
};

// Utility functions
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

// Calculate days remaining based on current level and average consumption
export const calculateDaysRemaining = (
  currentLevel,
  tankSize,
  avgDailyUsage
) => {
  const remainingWater = (currentLevel / 100) * tankSize;
  return Math.floor(remainingWater / avgDailyUsage);
};

// Get color based on water level
export const getWaterLevelColor = (level) => {
  if (level <= WATER_LEVELS.critical) return COLORS.danger;
  if (level <= WATER_LEVELS.warning) return COLORS.warning;
  return COLORS.success;
};

// Mock data (replace with API calls)
export const MOCK_DATA = {
  waterLevel: 65,
  tankSize: 5000, // liters
  avgDailyUsage: 125, // liters per day
  nextDelivery: "2025-06-15T12:00:00",
  autoOrder: true,
  lowWaterThreshold: 25,
  historyData: [
    { date: "2025-05-01", level: 95 },
    { date: "2025-05-05", level: 85 },
    { date: "2025-05-10", level: 75 },
    { date: "2025-05-15", level: 65 },
    { date: "2025-05-20", level: 45 },
    { date: "2025-05-25", level: 15 },
    { date: "2025-05-31", level: 90 }, // After delivery
  ],
  notifications: [
    {
      id: 1,
      type: "warning",
      message: "Water level at 30%",
      date: "2025-05-28T08:30:00",
    },
    {
      id: 2,
      type: "order",
      message: "Order #WO-5821 placed",
      date: "2025-05-29T10:15:00",
    },
    {
      id: 3,
      type: "delivery",
      message: "Delivery scheduled for May 31",
      date: "2025-05-29T10:20:00",
    },
    {
      id: 4,
      type: "delivery",
      message: "Delivery completed",
      date: "2025-05-31T14:45:00",
    },
  ],
  orders: [
    {
      id: "WO-5821",
      date: "2025-05-29T10:15:00",
      status: "Delivered",
      amount: 3000,
      price: 150.0,
      deliveryDate: "2025-05-31T14:45:00",
      invoice: "#INV-5821-29",
    },
    {
      id: "WO-6023",
      date: "2025-06-25T09:30:00",
      status: "Scheduled",
      amount: 3000,
      price: 150.0,
      deliveryDate: "2025-06-28T11:00:00",
      invoice: "#INV-6023-25",
    },
  ],
};
