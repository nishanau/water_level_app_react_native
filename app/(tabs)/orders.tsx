import { useAppContext } from "@/AppContext";
import OrderItem from "@/components/OrderCard"; // Make sure this import is correct
import { COLORS } from "@/constants";
import orderService from "@/services/orderService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define interfaces for our data types
interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  tankId: string;
  supplierId: string;
  orderDate: string;
  scheduledDeliveryDate: string;
  status: string;
  statusHistory: {
    status: string;
    timestamp: string;
    notes: string;
    _id: string;
  }[];
  quantity: number;
  price: number;
  paymentStatus: string;
  deliveryNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface DateTimePickerEvent {
  type: string;
  nativeEvent: {
    timestamp?: number;
  };
}

// Custom water-themed colors to match history screen
const AQUA_COLORS = {
  primary: "#0088cc", // Deeper blue
  secondary: "#4fb3ff", // Bright blue
  accent: "#00c6ff", // Cyan blue
  light: "#e1f5fe", // Very light blue
  medium: "#b3e5fc", // Light blue
  dark: "#0277bd", // Dark blue
  gradient: ["#e3f0ff", "#c2e9fb", "#f8fbff"], // Enhanced blue gradient
};

export default function OrdersScreen() {
  const { orders, rescheduleOrder, user, setNewNotification, loadUserData } =
    useAppContext();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState<boolean>(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter orders by status
  const upcomingOrders = orders.filter(
    (order: Order) =>
      order.status === "scheduled" ||
      order.status === "placed" ||
      order.status === "acknowledged"
  );

  const pastOrders = orders.filter(
    (order: Order) =>
      order.status === "completed" || order.status === "cancelled"
  );

  // Show cancel confirmation modal
  const showCancelConfirmation = (order: Order): void => {
    setOrderToCancel(order);
    setShowCancelConfirmModal(true);
  };

  // Handle order cancellation
  const handleCancelOrder = async (): Promise<void> => {
    try {
      if (orderToCancel) {
        await orderService.cancelOrder(orderToCancel._id);
        setOrderToCancel(null);
        const newNoti = {
          userId: user.id,
          type: "order",
          message: `Order ${orderToCancel.orderNumber} cancelled successfully!`,
          relatedTo: "order",
          read: false,
          sentVia: ["push"],
        };
        setNewNotification(newNoti);
      }

      Alert.alert(
        "Order Cancelled",
        "Your order has been cancelled successfully."
      );
      setShowCancelConfirmModal(false);
    } catch {
      Alert.alert(
        "Cancellation Failed",
        "An error occurred while cancelling the order. Please try again later."
      );
    }
  };
  // Handle order rescheduling
  const handleReschedule = (order: Order): void => {
    setSelectedOrder(order);
    const date = new Date(order.scheduledDeliveryDate);
    setSelectedDate(date);
    setDatePickerVisible(true);
  };

  // Handle date change
  const handleDateChange = (event: DateTimePickerEvent, date?: Date): void => {
    // On Android, the event.type will be 'set' if user selected a date
    // or 'dismissed' if user cancelled
    const userSelectedDate = event.type === "set" && date;

    if (Platform.OS === "android") {
      setDatePickerVisible(false);

      if (userSelectedDate && selectedOrder) {
        // Only reschedule if user actually selected a date
        rescheduleOrder(selectedOrder._id, date);
      }
      // If cancelled or dismissed, do nothing
      setSelectedOrder(null);
    } else {
      // On iOS, we show the confirmation buttons
      if (userSelectedDate) {
        setSelectedDate(date);
        setShowDatePicker(true);
      } else {
        // User cancelled
        setDatePickerVisible(false);
        setSelectedOrder(null);
      }
    }
  };

  // Confirm rescheduling (for iOS)
  const confirmRescheduling = (): void => {
    if (selectedOrder) {
      rescheduleOrder(selectedOrder._id, selectedDate);
      setShowDatePicker(false);
      setSelectedOrder(null);
    }
  };

  // Cancel rescheduling (for iOS)
  const cancelRescheduling = (): void => {
    setShowDatePicker(false);
    setSelectedOrder(null);
  };
  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Render header for each section
  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons
          name={title.includes("Upcoming") ? "truck-delivery" : "history"}
          size={22}
          color={AQUA_COLORS.primary}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.countBadge}>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced gradient background */}
      <LinearGradient
        colors={AQUA_COLORS.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Enhanced water-themed header */}
      <View style={styles.header}>
        <LinearGradient
          colors={["rgba(0,136,204,0.15)", "rgba(0,136,204,0)"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Water Deliveries</Text>
          <Text style={styles.subtitle}>Manage your delivery schedule</Text>
        </View>
        <View style={styles.waterDrop}>
          <MaterialCommunityIcons
            name="truck-delivery"
            size={24}
            color={AQUA_COLORS.primary}
          />
        </View>
      </View>

      <FlatList
        data={[]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AQUA_COLORS.primary, AQUA_COLORS.secondary]}
            tintColor={AQUA_COLORS.primary}
          />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Upcoming Orders Section */}
            <View style={styles.sectionContainer}>
              {renderSectionHeader(
                "Upcoming Deliveries",
                upcomingOrders.length
              )}
              {upcomingOrders.length > 0 ? (
                upcomingOrders.map((order: Order) => (
                  <View style={styles.orderCardWrapper} key={order._id}>
                    <OrderItem
                      order={order}
                      onCancel={showCancelConfirmation}
                      onReschedule={handleReschedule}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons
                      name="truck-delivery-outline"
                      size={42}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.emptyText}>No upcoming deliveries</Text>
                  <Text style={styles.emptySubtext}>
                    Orders you place will appear here
                  </Text>
                </View>
              )}
            </View>

            {/* Past Orders Section */}
            <View style={styles.sectionContainer}>
              {renderSectionHeader("Delivery History", pastOrders.length)}
              {pastOrders.length > 0 ? (
                pastOrders.map((order: Order) => (
                  <View style={styles.orderCardWrapper} key={order._id}>
                    <OrderItem
                      order={order}
                      onCancel={undefined}
                      onReschedule={undefined}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <View
                    style={[
                      styles.emptyIconContainer,
                      { backgroundColor: AQUA_COLORS.secondary },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="history"
                      size={42}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.emptyText}>No delivery history</Text>
                  <Text style={styles.emptySubtext}>
                    Completed deliveries will be shown here
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        renderItem={() => null}
      />

      {/* Date picker for Android */}
      {Platform.OS === "android" && datePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Date picker modal for iOS */}
      {Platform.OS === "ios" && (
        <Modal
          visible={datePickerVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconHeader}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={30}
                  color={AQUA_COLORS.primary}
                />
                <Text style={styles.modalTitle}>Reschedule Delivery</Text>
              </View>

              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />

              {showDatePicker && (
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelRescheduling}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmRescheduling}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Cancel Order Confirmation Modal */}
      <Modal
        visible={showCancelConfirmModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconHeader}>
              <MaterialCommunityIcons
                name="cancel"
                size={30}
                color={COLORS.danger}
              />
              <Text style={styles.modalTitle}>Cancel Delivery</Text>
            </View>

            <Text style={styles.modalText}>
              Are you sure you want to cancel this delivery? This action cannot
              be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCancelConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Keep Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: COLORS.danger },
                ]}
                onPress={handleCancelOrder}
              >
                <Text style={styles.confirmButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 40,
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
  headerContent: {
    position: "relative",
    zIndex: 1,
  },
  waterDrop: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AQUA_COLORS.dark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AQUA_COLORS.dark,
  },
  countBadge: {
    backgroundColor: AQUA_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    margin: 12,
    borderRadius: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AQUA_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    margin: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalIconHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    color: AQUA_COLORS.dark,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: AQUA_COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  orderCardWrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
});
