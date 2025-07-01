import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppContext } from "../AppContext";

// type Order = {
//   orderNumber: string,
//   status: string,
//   orderDate: string | number | Date,
//   scheduledDeliveryDate?: string | number | Date,
//   supplier: { company: string },
//   quantity: number,
//   price: number,
//   invoice?: { downloadURL: string, fileName: string },
// };

// type OrderItemProps = {
//   order: Order,
//   onCancel?: (order: Order) => void,
//   onReschedule?: (order: Order) => void,
// };

export const OrderItem = ({ order, onCancel, onReschedule }) => {
  const { tanks } = useAppContext();
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "scheduled":
        return "#ffc107";
      case "cancelled":
        return "#dc3545";
      case "placed":
        return "#17a2b8";
      default:
        return "#888888";
    }
  };

  return (
    <View style={styles.outerWrapper}>
      <View
        style={[
          styles.statusBar,
          { backgroundColor: getStatusColor(order.status) },
        ]}
      />
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{order.orderNumber}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderDate}>
            Order Date: {new Date(order.orderDate).toLocaleDateString()}
          </Text>
          {order.scheduledDeliveryDate ? (
            <Text style={styles.deliveryDate}>
              Delivery:{" "}
              {new Date(order.scheduledDeliveryDate).toLocaleDateString()}
            </Text>
          ) : (
            <Text style={styles.deliveryDate}>Delivery: Not Scheduled</Text>
          )}
          <Text>
            Tank:{" "}
            {tanks.find((tank) => tank._id === order.tankId)?.deviceId ||
              "Unknown"}
          </Text>
          <Text>Supplier: {order.supplier.company} </Text>
          <Text style={styles.orderAmount}>
            Amount: {order.quantity} L • ${order.price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          {order.invoice ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(order.invoice.downloadURL)}
              style={styles.invoiceTouchable}
            >
              <Text style={styles.invoiceLink}>
                <Text style={styles.invoiceIcon}>📄 </Text>
                {order.invoice.fileName}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noInvoice}>No Invoice Uploaded</Text>
          )}

          {(order.status === "scheduled" || order.status === "placed") && (
            <View style={styles.orderActions}>
              {onCancel && (
                <Text
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => onCancel(order)}
                >
                  Cancel
                </Text>
              )}
              {onReschedule && order.status === "scheduled" && (
                <Text
                  style={[styles.actionButton, styles.rescheduleButton]}
                  onPress={() => onReschedule(order)}
                >
                  Reschedule
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 12, // reduced margin
    borderRadius: 14,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statusBar: {
    width: 7,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  orderItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingVertical: 14, // reduced vertical padding
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10, // reduced
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  orderDetails: {
    marginBottom: 8, // reduced
  },
  orderDate: {
    color: "#666",
    fontSize: 15,
    marginBottom: 2,
    fontWeight: "500",
  },
  deliveryDate: {
    color: "#666",
    fontSize: 15,
    marginBottom: 2,
    fontWeight: "500",
  },
  orderAmount: {
    fontSize: 16,
    marginTop: 4, // reduced
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 8,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    overflow: "hidden",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  rescheduleButton: {
    backgroundColor: "#cce5ff",
    color: "#004085",
  },
  invoiceTouchable: {
    alignSelf: "flex-start",
  },
  invoiceLink: {
    color: "#0088cc",
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#f2f9ff",
    flexDirection: "row",
    alignItems: "center",
  },
  invoiceIcon: {
    fontSize: 16,
    marginRight: 2,
  },
  noInvoice: {
    color: "#bbb",
    fontSize: 14,
    fontStyle: "italic",
  },
});
