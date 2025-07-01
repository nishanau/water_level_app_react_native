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
    notificationPreferences,
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
        <MaterialCommunityIcons name="water" size={22} color={COLORS.primary} />
        <Text style={styles.tankOverviewTitle}>{tank.deviceId}</Text>
      </View>
      <Text style={styles.tankOverviewDetail}>Capacity: {tank.capacity} L</Text>
      <Text style={styles.tankOverviewDetail}>
        Avg Usage: {tank.avgDailyUsage} L
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
      >
        <Ionicons name="location-sharp" size={16} color={COLORS.secondary} />
        <Text style={styles.tankOverviewLocation} numberOfLines={1}>
          {tank.location?.address || "No location"}
        </Text>
      </View>
      {/* Removed Selected/View button */}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colorScheme === "dark" ? "#fff" : "#000"}
        barStyle={colorScheme === "dark" ? "dark-content" : "light-content"}
      />
      {/* Gradient background for the whole screen */}
      <LinearGradient
        colors={["#e3f0ff", "#f8fbff", "#fff"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Gradient background */}
        <View style={styles.gradientBg} />

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
            <Text style={styles.greetingSubText}>Welcome back 👋</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              style={styles.notificationsButton}
              onPress={() => setActiveTab("notifications")}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={25}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => router.push("/settings")}
            >
              {/* <Image
                source={
                  user?.avatar
                    ? { uri: user.avatar }
                    : require("../../assets/images/avatar-default.png")
                }
                style={styles.avatarImg}
              /> */}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Tank Overview + Add Tank */}
        {tanks && (
          <View style={styles.tankOverviewRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {tanks.length > 0 && tanks.map(renderTankCard)}
              {/* Add Tank Card */}
              <TouchableOpacity
                style={styles.addTankCard}
                onPress={handleAddTank}
              >
                <MaterialCommunityIcons
                  name="plus-box"
                  size={38}
                  color={COLORS.primary}
                />
                <Text style={styles.addTankText}>Add Tank</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Main TankLevel */}
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
            <ActivityIndicator size="large" color={COLORS.primary} />
          )}
        </View>

        {/* Modernized Next Delivery */}
        <View style={styles.deliveryCard}>
          <MaterialCommunityIcons
            name="truck-delivery"
            size={28}
            color={COLORS.primary}
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
              color={COLORS.primary}
            />
            <Text style={styles.deliveryActionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Modernized Auto-Order */}
        <View style={styles.autoOrderModernCard}>
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
            trackColor={{ false: "#d1d1d1", true: COLORS.secondary }}
            thumbColor={autoOrder ? COLORS.primary : "#f4f3f4"}
          />
        </View>

        {/* Modernized Place Manual Order */}
        <TouchableOpacity
          style={[styles.modernOrderBtn, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <MaterialCommunityIcons name="water" size={22} color={COLORS.white} />
          <Text style={styles.modernOrderBtnText}>Place Manual Order</Text>
        </TouchableOpacity>

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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
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
                  style={{ padding: 4, marginLeft: 8 }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={COLORS.primary}
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
                  <Text style={styles.emptyMessage}>No notifications yet</Text>
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
  notificationsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  notificationsPopover: {
    position: "absolute",
    top: 122, // adjust based on your header height
    right: 68, // align with your bell icon
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
    borderBottomColor: COLORS.white,
    marginRight: 16,
  },
  notificationsPopoverContent: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
    padding: 16,
    width: 320,
    maxHeight: 400,
    shadowColor: COLORS.black,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  notificationsPopoverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  notificationsList: {
    flex: 1,
  },
  emptyMessage: {
    textAlign: "center",
    color: COLORS.background,
    fontSize: 16,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.text,
  },
  notificationHeader: {
    padding: 30,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    // Remove backgroundColor to allow gradient to show
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  tankContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  infoContainer: {
    marginVertical: 20,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  autoOrderContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginVertical: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  switchDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  actionButtonsContainer: {
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  quickStats: {
    flexDirection: "row",
    marginVertical: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: COLORS.lightGray,
  },
  tabText: {
    marginLeft: 4,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  gradientBg: {
    display: "none", // Remove old gradientBg
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 2,
  },
  greetingSubText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: "500",
  },
  avatarBtn: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.primary,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  // Modernized Next Delivery
  deliveryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginTop: 10,
  },
  deliveryIcon: {
    marginRight: 14,
  },
  deliveryLabel: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  deliveryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  deliveryActionText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },

  // Modernized Auto-Order
  autoOrderModernCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  autoOrderIcon: {
    marginRight: 14,
  },
  autoOrderLabel: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: "600",
    marginBottom: 2,
  },
  autoOrderDesc: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },

  // Modernized Place Manual Order
  modernOrderBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modernOrderBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  tankOverviewScrollWrapper: {
    marginBottom: 18,
    marginTop: 2,
  },
  tankOverviewCard: {
    width: 170,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    // transition for smooth highlight
    transitionProperty: "background-color, border-color",
    transitionDuration: "200ms",
  },
  tankOverviewCardSelected: {
    backgroundColor: "#e3f0ff",
    borderColor: COLORS.primary,
  },
  tankOverviewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: 6,
  },
  tankOverviewDetail: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  tankOverviewLocation: {
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 4,
    flexShrink: 1,
  },
  addTankCard: {
    width: 170,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    marginLeft: 0,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  addTankText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 8,
  },
});
