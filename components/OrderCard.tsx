import { COLORS, formatDate } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Define interface for order item props
interface OrderItemProps {
  order: {
    _id: string;
    orderNumber: string;
    status: string;
    scheduledDeliveryDate: string;
    tankId: string;
    quantity: number;
    price: number;
    createdAt: string;
  };
  onCancel?: (order: any) => void;
  onReschedule?: (order: any) => void;
}

// This component displays a single order card
export const OrderItem: React.FC<OrderItemProps> = ({
  order,
  onCancel,
  onReschedule,
}) => {
  // Helper to get color based on order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "#4fb3ff"; // light blue
      case "acknowledged":
        return "#9c27b0"; // purple
      case "scheduled":
        return "#ff9800"; // orange
      case "completed":
        return "#4caf50"; // green
      case "cancelled":
        return "#f44336"; // red
      default:
        return COLORS.gray;
    }
  };

  // Helper to get appropriate icon based on order status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
        return "clipboard-check-outline";
      case "acknowledged":
        return "clipboard-check";
      case "scheduled":
        return "truck-delivery-outline";
      case "completed":
        return "check-circle";
      case "cancelled":
        return "cancel";
      default:
        return "help-circle-outline";
    }
  };

  // Format the status text for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumberLabel}>Order</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) },
          ]}
        >
          <MaterialCommunityIcons
            name={getStatusIcon(order.status)}
            size={14}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="calendar"
              size={18}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Scheduled For</Text>
              <Text style={styles.infoValue}>
                {order?.scheduledDeliveryDate
                  ? formatDate(order.scheduledDeliveryDate)
                  : "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="water"
              size={18}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>{order.quantity} L</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Order Date</Text>
              <Text style={styles.infoValue}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={18}
              color={COLORS.primary}
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>${order.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Only show action buttons for orders that aren't completed or cancelled */}
      {order.status !== "completed" && order.status !== "cancelled" && (
        <View style={styles.cardActions}>
          {onReschedule && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onReschedule(order)}
            >
              <MaterialCommunityIcons
                name="calendar-clock"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
          )}

          {onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onCancel(order)}
            >
              <MaterialCommunityIcons
                name="cancel"
                size={16}
                color={COLORS.danger}
              />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: "#e1f5fe",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderNumberLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginRight: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.primary,
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: "#ffebee",
  },
  cancelButtonText: {
    color: COLORS.danger,
  },
});

// Ensure we're exporting the component properly
export default OrderItem;
