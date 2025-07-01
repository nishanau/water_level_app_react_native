import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
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
  selectedTank,
}) => {
  const [open, setOpen] = React.useState(false);
  // Only keep variables that are used
  const color = getWaterLevelColor(level);
  const handleChange = (value) => {
    setSelectedTank(value);
  };

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

          {tanks && tanks.length > 1 && Platform.OS !== "android" && (
            <>
              <Picker
                selectedValue={selectedTank}
                onValueChange={(itemValue) => handleChange(itemValue)}
                style={[
                  styles.dropdown,
                  {
                    height: 30,
                    width: 90,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: COLORS.border,
                    borderRadius: 50,
                    paddingHorizontal: 5,
                    fontSize: 12,
                    marginTop: 20,
                  },
                  styles.dropdownText,
                  {
                    fontSize: 12,
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
          {tanks && tanks.length > 1 && Platform.OS === "android" && (
            <>
              <DropDownPicker
                open={open}
                value={selectedTank}
                items={tanks.map((tank) => ({
                  label: tank.deviceId,
                  value: tank._id,
                }))}
                setOpen={setOpen}
                setValue={handleChange}
                placeholder="Select Tank"
                style={{
                  height: 20,
                  width: 120,
                  borderWidth: 1,
                  borderColor: COLORS.border,

                  borderRadius: 50,
                  paddingHorizontal: 15,
                  fontSize: 12,
                  marginTop: 10,
                  marginLeft: 50,
                }}
                textStyle={{
                  fontSize: 12,
                  color: COLORS.text,
                }}
                placeholderStyle={{
                  color: COLORS.gray,
                }}
                dropDownContainerStyle={{
                  borderColor: COLORS.border,
                  borderRadius: 12,
                }}
              />
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
