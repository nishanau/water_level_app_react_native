import { useAppContext } from "@/AppContext";
import { NotificationItem as NotificationItemComponent } from "@/components";
import { ManualOrderModal } from "@/components/ManualOrderModal";
import { TankLevel } from "@/components/TankLevel";
import { calculateDaysRemaining, COLORS, formatDate } from "@/constants";
import apiService from "@/services/apiService";
import orderService from "@/services/orderService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// Custom water-themed colors to match other screens
const AQUA_COLORS = {
  primary: "#0088cc", // Deeper blue
  secondary: "#4fb3ff", // Bright blue
  accent: "#00c6ff", // Cyan blue
  light: "#e1f5fe", // Very light blue
  medium: "#b3e5fc", // Light blue
  dark: "#0277bd", // Dark blue
  gradient: ["#e3f0ff", "#c2e9fb", "#f8fbff"], // Enhanced blue gradient
};

interface Notification {
  _id: string;
  type: string;
  message: string;
  date: string;
  userId: string;
  read: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<"notifications" | "home">("home");
  const greetingAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  const {
    waterLevel,
    tankSize,
    setTankSize,
    setAvgDailyUsage,
    setLowWaterThreshold,
    avgDailyUsage,
    nextDelivery,
    autoOrder,
    user,
    loading,
    setUser,
    setAutoOrder,
    suppliers,
    preferredSupplier,
    tanks,
    setSelectedTank,
    selectedTank,
    setNewNotification,
    notifications,
    loadUserData,
  } = useAppContext();

  useEffect(() => {
    const selectTankData = tanks.find((tank: any) => tank._id === selectedTank);
    setTankSize(selectTankData?.capacity || 0);
    setAvgDailyUsage(selectTankData?.avgDailyUsage || 0);
    setLowWaterThreshold(selectTankData?.lowWaterThreshold || 0);
  }, [selectedTank]);

  // Animate greeting on mount
  useEffect(() => {
    Animated.timing(greetingAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calculate days remaining
  const daysRemaining = calculateDaysRemaining(
    waterLevel,
    tankSize,
    avgDailyUsage
  );

  // Auto-order toggle function
  const toggleAutoOrder = async () => {
    const newAutoOrderValue = !autoOrder;
    try {
      // Update state for immediate UI feedback
      setAutoOrder(newAutoOrderValue);

      // Update in database
      const response = await apiService.patchFields("users", user.id, {
        autoOrder: newAutoOrderValue,
      });

      if (response) {
        // Get current userData from AsyncStorage
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          // Parse the existing userData
          const userData = JSON.parse(userDataString);

          // Update just the autoOrder field
          userData.autoOrder = newAutoOrderValue;

          // Save the updated userData back to AsyncStorage
          await AsyncStorage.setItem("userData", JSON.stringify(userData));

          // Also update the user object in context
          if (setUser) {
            // If you have setUser exposed in context
            setUser(userData);
          }
        }
      } else {
        Alert.alert(
          "Update Failed",
          "Failed to update auto-order setting. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating auto-order:", error);
    }
  };

  // Place manual order
  const handlePlaceOrder = () => {
    setShowManualOrderModal(true);
  };

  const handleConfirmOrder = async (orderData: {
    quantity: number;
    supplierId: string;
    requestedDeliveryDate: Date;
    deliveryNotes: string;
    tankId: string;
    price: number;
  }) => {
    try {
      const order = await orderService.placeOrder(orderData);

      const newNoti = {
        userId: user.id,
        type: "order",
        message: `Order placed successfully!`,
        relatedTo: "order",
        read: false,
        sentVia: ["push"],
      };
      setNewNotification(newNoti);
      setShowManualOrderModal(false);
      // Refresh user data to get updated orders
      // Show success alert
      Alert.alert("Order Placed", "Your order has been placed successfully.");
      return order;
    } catch (error) {
      console.error("Failed to place order:", error);
      Alert.alert(
        "Error",
        "Failed to place your order. Please try again later."
      );
      throw error;
    }
  };

  // View order history
  const viewOrderHistory = () => {
    router.push("/orders");
  };

  // Quick Actions handlers
  const handleAddTank = () => {
    Alert.alert("Add Tank", "Add tank feature coming soon!");
  };

  const handleRefresh = () => {
    loadUserData();
    Alert.alert("Refreshed", "Data refreshed.");
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Tank overview cards
  const renderTankCard = (tank: any) => (
    <TouchableOpacity
      key={tank._id}
      style={[
        styles.tankOverviewCard,
        selectedTank === tank._id && styles.tankOverviewCardSelected,
      ]}
      activeOpacity={0.85}
      onPress={() => setSelectedTank(tank._id)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialCommunityIcons
          name="water-pump"
          size={22}
          color={AQUA_COLORS.primary}
        />
        <Text style={styles.tankOverviewTitle}>{tank.deviceId}</Text>
      </View>
      <Text style={styles.tankOverviewDetail}>Capacity: {tank.capacity} L</Text>
      <Text style={styles.tankOverviewDetail}>
        Avg Usage: {tank.avgDailyUsage} L
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
      >
        <Ionicons
          name="location-sharp"
          size={16}
          color={AQUA_COLORS.secondary}
        />
        <Text style={styles.tankOverviewLocation} numberOfLines={1}>
          {tank.location?.address || "No location"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colorScheme === "dark" ? "#fff" : "#000"}
        barStyle={colorScheme === "dark" ? "dark-content" : "light-content"}
      />

      {/* Enhanced water-themed gradient background */}
      <LinearGradient
        colors={AQUA_COLORS.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AQUA_COLORS.primary, AQUA_COLORS.secondary]}
            tintColor={AQUA_COLORS.primary}
          />
        }
      >
        {/* Enhanced water-themed header */}
        <View style={styles.header}>
          <LinearGradient
            colors={["rgba(0,136,204,0.15)", "rgba(0,136,204,0)"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Greeting and profile */}
          <Animated.View
            style={[
              styles.greetingRow,
              {
                opacity: greetingAnim,
                transform: [
                  {
                    translateY: greetingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View>
              <Text style={styles.greetingText}>
                {getGreeting()}, {user?.firstName || user?.name || "User"}!
              </Text>
              <Text style={styles.greetingSubText}>Welcome to AquaPulse</Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                style={styles.notificationsButton}
                onPress={() => setActiveTab("notifications")}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={25}
                  color={AQUA_COLORS.primary}
                />
                {notifications.length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notifications.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => router.push("/settings")}
              >
                <MaterialCommunityIcons
                  name="account-circle"
                  size={32}
                  color={AQUA_COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Tank Overview + Add Tank */}
        {tanks && (
          <View style={styles.tankOverviewRow}>
            <Text style={styles.sectionTitle}>My Water Tanks</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {tanks.length > 0 && tanks.map(renderTankCard)}
              {/* Add Tank Card */}
              <TouchableOpacity
                style={styles.addTankCard}
                onPress={handleAddTank}
              >
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={38}
                  color={AQUA_COLORS.primary}
                />
                <Text style={styles.addTankText}>Add Tank</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Main TankLevel with enhanced styling */}
        <View style={styles.tankContainer}>
          {tanks ? (
            <TankLevel
              level={waterLevel}
              size={250}
              tanks={tanks}
              setSelectedTank={setSelectedTank}
              selectedTank={selectedTank}
              tankSize={tankSize}
              avgDailyUsage={avgDailyUsage}
              daysRemaining={calculateDaysRemaining(
                waterLevel,
                tankSize,
                avgDailyUsage
              )}
            />
          ) : (
            <ActivityIndicator size="large" color={AQUA_COLORS.primary} />
          )}
        </View>

        {/* Days remaining callout */}
        <View style={styles.daysRemainingCard}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={28}
            color={daysRemaining < 5 ? COLORS.warning : AQUA_COLORS.primary}
            style={styles.daysRemainingIcon}
          />
          <View style={styles.daysRemainingContent}>
            <Text style={styles.daysRemainingLabel}>
              Estimated Days Remaining
            </Text>
            <Text
              style={[
                styles.daysRemainingValue,
                daysRemaining < 5 && styles.daysRemainingLow,
              ]}
            >
              {daysRemaining} days
            </Text>
            <View style={styles.daysRemainingMeter}>
              <View
                style={[
                  styles.daysRemainingFill,
                  {
                    width: `${Math.min(100, (daysRemaining / 30) * 100)}%`,
                    backgroundColor:
                      daysRemaining < 5
                        ? COLORS.warning
                        : daysRemaining < 10
                        ? COLORS.secondary
                        : AQUA_COLORS.primary,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Next Delivery Card */}
        <View style={styles.deliveryCard}>
          <MaterialCommunityIcons
            name="truck-delivery"
            size={28}
            color={AQUA_COLORS.primary}
            style={styles.deliveryIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.deliveryLabel}>Next Scheduled Delivery</Text>
            <Text style={styles.deliveryValue}>
              {nextDelivery ? formatDate(nextDelivery) : "Not Scheduled"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deliveryActionBtn}
            onPress={viewOrderHistory}
          >
            <MaterialCommunityIcons
              name="history"
              size={20}
              color={AQUA_COLORS.primary}
            />
            <Text style={styles.deliveryActionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Auto-Order Card */}
        <View style={styles.autoOrderCard}>
          <MaterialCommunityIcons
            name="autorenew"
            size={24}
            color={autoOrder ? COLORS.success : COLORS.gray}
            style={styles.autoOrderIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.autoOrderLabel}>Auto-Ordering</Text>
            <Text style={styles.autoOrderDesc}>
              {autoOrder
                ? "Enabled: Orders will be placed automatically when water is low."
                : "Disabled: Place orders manually when needed."}
            </Text>
          </View>
          <Switch
            value={autoOrder}
            onValueChange={toggleAutoOrder}
            trackColor={{ false: "#d1d1d1", true: AQUA_COLORS.secondary }}
            thumbColor={autoOrder ? AQUA_COLORS.primary : "#f4f3f4"}
          />
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handlePlaceOrder}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: AQUA_COLORS.primary },
                ]}
              >
                <MaterialCommunityIcons name="water" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Order Water</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/history")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: AQUA_COLORS.secondary },
                ]}
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.quickActionText}>View Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/settings")}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#9c27b0" }]}
              >
                <MaterialCommunityIcons name="cog" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ManualOrderModal
          visible={showManualOrderModal}
          onClose={() => setShowManualOrderModal(false)}
          onConfirm={handleConfirmOrder}
          loading={loading}
          suppliers={suppliers}
          preferredSupplier={preferredSupplier}
          tanks={tanks}
        />
      </ScrollView>

      {/* Notifications popover */}
      {activeTab === "notifications" && (
        <Pressable
          style={styles.notificationOverlay}
          onPress={() => setActiveTab("home")}
        >
          <View style={styles.notificationsPopover} pointerEvents="box-none">
            <View style={styles.caretPopover} />
            <View style={styles.notificationsPopoverContent}>
              <View style={styles.notificationsPopoverHeader}>
                <Text style={styles.notificationsTitle}>
                  Recent Notifications
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveTab("home")}
                  style={styles.closeNotificationsButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={AQUA_COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 250 }}>
                {notifications.length > 0 ? (
                  notifications.map((notification: Notification) => (
                    <NotificationItemComponent
                      key={notification._id}
                      notification={notification}
                    />
                  ))
                ) : (
                  <View style={styles.emptyNotifications}>
                    <MaterialCommunityIcons
                      name="bell-off-outline"
                      size={40}
                      color={COLORS.gray}
                      style={{ marginBottom: 10 }}
                    />
                    <Text style={styles.emptyMessage}>
                      No notifications yet
                    </Text>
                    <Text style={styles.emptySubMessage}>
                      We'll notify you about important updates and delivery
                      status changes
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 12,
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 18,
    paddingHorizontal: 2,
    zIndex: 1,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "700",
    color: AQUA_COLORS.dark,
    marginBottom: 2,
  },
  greetingSubText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: "500",
  },
  notificationsButton: {
    position: "relative",
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  avatarBtn: {
    borderRadius: 24,
    overflow: "hidden",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AQUA_COLORS.dark,
    marginLeft: 16,
    marginBottom: 12,
  },
  tankOverviewRow: {
    marginBottom: 16,
  },
  tankOverviewCard: {
    width: 170,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 6,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  tankOverviewCardSelected: {
    backgroundColor: "rgba(225, 245, 254, 0.9)",
    borderColor: AQUA_COLORS.primary,
  },
  tankOverviewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AQUA_COLORS.dark,
    marginLeft: 6,
  },
  tankOverviewDetail: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 6,
  },
  tankOverviewLocation: {
    fontSize: 12,
    color: AQUA_COLORS.secondary,
    marginLeft: 4,
    flexShrink: 1,
  },
  addTankCard: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: AQUA_COLORS.primary,
  },
  addTankText: {
    fontSize: 15,
    color: AQUA_COLORS.primary,
    fontWeight: "600",
    marginTop: 8,
  },
  tankContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  daysRemainingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    padding: 16,
    margin: 12,
    marginTop: 4,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: AQUA_COLORS.light,
  },
  daysRemainingIcon: {
    marginRight: 14,
  },
  daysRemainingContent: {
    flex: 1,
  },
  daysRemainingLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  daysRemainingValue: {
    fontSize: 20,
    fontWeight: "700",
    color: AQUA_COLORS.dark,
    marginBottom: 6,
  },
  daysRemainingLow: {
    color: COLORS.warning,
  },
  daysRemainingMeter: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  daysRemainingFill: {
    height: "100%",
    backgroundColor: AQUA_COLORS.primary,
    borderRadius: 3,
  },
  deliveryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    padding: 16,
    margin: 12,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: AQUA_COLORS.light,
  },
  deliveryIcon: {
    marginRight: 14,
  },
  deliveryLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: AQUA_COLORS.dark,
  },
  deliveryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AQUA_COLORS.light,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  deliveryActionText: {
    color: AQUA_COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },
  autoOrderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    padding: 16,
    margin: 12,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: AQUA_COLORS.light,
  },
  autoOrderIcon: {
    marginRight: 14,
  },
  autoOrderLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  autoOrderDesc: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  quickActionsSection: {
    marginVertical: 16,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  quickActionButton: {
    width: "30%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AQUA_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  notificationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  notificationsPopover: {
    position: "absolute",
    top: 110,
    right: 60,
    width: 320,
    zIndex: 100,
    alignItems: "flex-end",
  },
  caretPopover: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(255, 255, 255, 0.95)",
    marginRight: 16,
  },
  notificationsPopoverContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    width: 320,
    maxHeight: 400,
    shadowColor: COLORS.black,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
    borderWidth: 1,
    borderColor: AQUA_COLORS.light,
  },
  notificationsPopoverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: AQUA_COLORS.light,
    paddingBottom: 8,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AQUA_COLORS.dark,
  },
  closeNotificationsButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: AQUA_COLORS.light,
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyMessage: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.gray,
    marginBottom: 6,
  },
  emptySubMessage: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 18,
  },
});
