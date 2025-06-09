import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, getWaterLevelColor } from "../constants";


export const WaterTankIndicator = ({ level, size = 200 }) => {
  const waterHeight = (level / 100) * size;
  const color = getWaterLevelColor(level);

  return (
    <View style={[styles.tankContainer, { height: size }]}>
      <View
        style={[
          styles.waterLevel,
          {
            height: waterHeight,
            backgroundColor: color,
          },
        ]}
      />
      <View style={styles.markersContainer}>
        {[0, 25, 50, 75, 100].map((mark) => (
          <View
            key={mark}
            style={[styles.marker, { bottom: (mark / 100) * size }]}
          >
            <Text style={styles.markerText}>{mark}%</Text>
          </View>
        ))}
      </View>
      <Text style={styles.percentageText}>{Math.round(level)}%</Text>
    </View>
  );
};

export const CircularProgressIndicator = ({
  level,
  size = 200,
  strokeWidth = 15,
  tanks,
  setSelectedTank,
}) => {
  // Only keep variables that are used
  const color = getWaterLevelColor(level);
  const handleChange = (value) => {
    setSelectedTank(value);
  };
    console.log("tank length", tanks.length);

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.circularBackground}>
        <View
          style={[
            styles.circularContent,
            { width: size - 40, height: size - 40 },
          ]}
        >
          <Text style={styles.circularPercentage}>{Math.round(level)}%</Text>
          <Text style={styles.circularLabel}>Water Level</Text>
          
          {tanks && tanks.length > 1 && (
            <>
            <Text style={styles.circularLabel}>Select Tank:</Text>
            <Picker
              selectedValue={tanks[0]._id}
              onValueChange={(itemValue) => handleChange(itemValue)}
              style={[
                styles.dropdown,
                {
                  height: 50,
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 4,
                  paddingHorizontal: 12,
                  fontSize: 16,
                },
                styles.dropdownText,
                {
                  fontSize: 16,
                  color: COLORS.text,
                },
              ]}
            >
              <Picker.Item
                label="Select Tank"
                value=""
                style={
                  (styles.dropdownPlaceholder,
                  {
                    color: COLORS.gray,
                  })
                }
              />
              {tanks.map((tank) => (
                <Picker.Item
                  key={tank._id}
                  label={tank.deviceId}
                  value={tank._id}
                  style={
                    (styles.dropdownText,
                    {
                      fontSize: 16,
                      color: COLORS.text,
                    })
                  }
                />
              ))}
            </Picker>
            </>
          )}
        </View>
      </View>

      <View style={[styles.svg, { width: size, height: size }]}>
        <View
          style={[
            styles.circleBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: "#e8e8e8",
            },
          ]}
        />

        <View
          style={[
            styles.circleForeground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              // Simulate stroke-dasharray and stroke-dashoffset with border
              // This is a simplified version; in a real app, use react-native-svg
              opacity: level / 100,
              transform: [{ rotate: `${360 * (1 - level / 100)}deg` }],
            },
          ]}
        />
      </View>
    </View>
  );
};

export const OrderItem = ({ order, onCancel, onReschedule }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#28a745";
      case "In Transit":
        return "#0088cc";
      case "Scheduled":
        return "#ffc107";
      case "Cancelled":
        return "#dc3545";
      default:
        return "#888888";
    }
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{order.name}</Text>
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
          Order Date: {new Date(order.date).toLocaleDateString()}
        </Text>
        {order.deliveryDate ? (
          <Text style={styles.deliveryDate}>
            Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
          </Text>
        ) : (
          <Text style={styles.deliveryDate}>Delivery: Not Scheduled</Text>
        )}
        <Text style={styles.orderAmount}>
          Amount: {order.amount} L • ${order.price.toFixed(2)}
        </Text>
      </View>

      {(order.status === "Scheduled" || order.status === "placed") && (
        <View style={styles.orderActions}>
          {onCancel && (
            <Text
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onCancel(order.id)}
            >
              Cancel
            </Text>
          )}
          {onReschedule && order.status === "Scheduled" && (
            <Text
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={() => onReschedule(order)}
            >
              Reschedule
            </Text>
          )}
        </View>
      )}

      {order.invoice && (
        <Text style={styles.invoiceLink}>Invoice: {order.invoice}</Text>
      )}
    </View>
  );
};

export const NotificationItem = ({ notification }) => {
  const getIconName = (type) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "order":
        return "🛒";
      case "delivery":
        return "🚚";
      case "cancel":
        return "❌";
      case "reschedule":
        return "📅";
      default:
        return "ℹ️";
    }
  };

  return (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationIcon}>
        {getIconName(notification.type)}
      </Text>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationDate}>
          {new Date(notification.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

export const SettingItem = ({ title, children }) => {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.settingContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Water Tank Indicator
  tankContainer: {
    width: 120,
    borderWidth: 2,
    borderColor: "#888",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  waterLevel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0088cc",
  },
  markersContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: "absolute",
    left: -25,
    width: 20,
    height: 1,
    backgroundColor: "#888",
  },
  markerText: {
    position: "absolute",
    left: -25,
    fontSize: 10,
    color: "#888",
  },
  percentageText: {
    position: "absolute",
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    top: "50%",
    left: 0,
    right: 0,
    textAlign: "center",
    textShadowColor: "rgba(255, 255, 255, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Circular Progress
  circularContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  circleBackground: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  circleForeground: {
    position: "absolute",
    top: 0,
    left: 0,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  circularBackground: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  circularContent: {
    backgroundColor: "#f8f8f8",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  circularPercentage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  circularLabel: {
    fontSize: 14,
    color: "#666",
  },

  // Order Item
  orderItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  orderDetails: {
    marginBottom: 10,
  },
  orderDate: {
    color: "#666",
    fontSize: 14,
    marginBottom: 2,
  },
  deliveryDate: {
    color: "#666",
    fontSize: 14,
    marginBottom: 2,
  },
  orderAmount: {
    fontSize: 14,
    marginTop: 4,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
    overflow: "hidden",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  rescheduleButton: {
    backgroundColor: "#cce5ff",
    color: "#004085",
  },
  invoiceLink: {
    marginTop: 10,
    color: "#0088cc",
    textDecorationLine: "underline",
  },

  // Notification Item
  notificationItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: "#888",
  },

  // Setting Item
  settingItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  settingContent: {
    marginTop: 4,
  },
});
