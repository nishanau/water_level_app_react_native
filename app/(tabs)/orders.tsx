import { useAppContext } from "@/AppContext";
import { OrderItem } from "@/components";
import { COLORS } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
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

export default function OrdersScreen() {
  const { orders, cancelOrder, rescheduleOrder } = useAppContext();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState<boolean>(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  // Filter orders by status
  const upcomingOrders = orders.filter(
    (order: Order) =>
      order.status === "placed" ||
      order.status === "accepted" ||
      order.status === "in_transit"
  );

  const pastOrders = orders.filter(
    (order: Order) =>
      order.status === "delivered" || order.status === "cancelled"
  );

  // Show cancel confirmation modal
  const showCancelConfirmation = (orderId: string): void => {
    setOrderToCancel(orderId);
    setShowCancelConfirmModal(true);
  };

  // Handle order cancellation
  const handleCancelOrder = async (): Promise<void> => {
    if (orderToCancel) {
      await cancelOrder(orderToCancel);
      setOrderToCancel(null);
    }
    setShowCancelConfirmModal(false);
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
        rescheduleOrder(selectedOrder.id, date);
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
      rescheduleOrder(selectedOrder.id, selectedDate);
      setShowDatePicker(false);
      setSelectedOrder(null);
    }
  };

  // Cancel rescheduling (for iOS)
  const cancelRescheduling = (): void => {
    setShowDatePicker(false);
    setSelectedOrder(null);
  };
  // Render header for each section
  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count} orders</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Water Orders</Text>
      </View>
      <FlatList
        data={[]}
        ListHeaderComponent={() => (
          <View>
            {/* Upcoming Orders Section */}
            <View>
              {renderSectionHeader("Upcoming Orders", upcomingOrders.length)}
              {upcomingOrders.length > 0 ? (
                upcomingOrders.map((order: Order) => (
                  <OrderItem
                    key={order._id}
                    order={{
                      id: order.orderNumber,
                      date: order.orderDate,
                      status: order.status,
                      amount: order.quantity,
                      price: order.price,
                      deliveryDate: order.scheduledDeliveryDate,
                      invoice: order.orderNumber,
                    }}
                    onCancel={showCancelConfirmation}
                    onReschedule={handleReschedule}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="truck-delivery-outline"
                    size={48}
                    color={COLORS.gray}
                  />
                  <Text style={styles.emptyText}>No upcoming orders</Text>
                  <Text style={styles.emptySubtext}>
                    Your next order will appear here
                  </Text>
                </View>
              )}
            </View>

            {/* Past Orders Section */}
            <View>
              {renderSectionHeader("Past Orders", pastOrders.length)}
              {pastOrders.length > 0 ? (
                pastOrders.map((order: Order) => (
                  <OrderItem
                    key={order._id}
                    order={{
                      id: order.orderNumber,
                      date: order.orderDate,
                      status: order.status,
                      amount: order.quantity,
                      price: order.price,
                      deliveryDate: order.scheduledDeliveryDate,
                      invoice: order.orderNumber,
                    }}
                    onCancel={undefined}
                    onReschedule={undefined}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="history"
                    size={48}
                    color={COLORS.gray}
                  />
                  <Text style={styles.emptyText}>No past orders</Text>
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
              <Text style={styles.modalTitle}>Reschedule Delivery</Text>

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
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <Text style={styles.modalText}>
              Are you sure you want to cancel order {orderToCancel}? This action
              cannot be undone.
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
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.gray,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  }, // Modal styles
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "500",
  },
});
