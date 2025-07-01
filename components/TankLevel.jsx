import { COLORS, getWaterLevelColor } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const TankLevel = ({
  level,
  size = 200,
  tankSize,
  avgDailyUsage,
  daysRemaining,
}) => {
  const color = getWaterLevelColor(level);

  // Tank dimensions
  const tankWidth = size * 0.44;
  const tankHeight = size * 0.9;
  const waterHeight = (level / 100) * (tankHeight - 16);

  return (
    <View style={styles.outerCard}>
      <View style={styles.flexRow}>
        {/* Left: Info */}
        <View style={styles.infoCol}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="water"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.infoLabel}>Tank Size:</Text>
            <Text style={styles.infoValue}>{tankSize} L</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="water-percent"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.infoLabel}>Avg. Usage:</Text>
            <Text style={styles.infoValue}>{avgDailyUsage} L</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.infoLabel}>Est Days Rem:</Text>
            <Text style={styles.infoValue}>{daysRemaining} days</Text>
          </View>
        </View>
        {/* Right: Tank visual */}
        <View style={styles.tankVisualCol}>
          <View
            style={[
              styles.tankBody,
              { width: tankWidth, height: tankHeight },
            ]}
          >
            {/* Tank Cap */}
            <View
              style={[
                styles.tankCap,
                { width: tankWidth * 0.7, left: tankWidth * 0.15 },
              ]}
            />
            {/* Tank Outline */}
            <View
              style={[
                styles.tankOutline,
                { width: tankWidth, height: tankHeight },
              ]}
            />
            {/* Water Fill */}
            <View
              style={[
                styles.tankWater,
                {
                  width: tankWidth - 10,
                  height: waterHeight,
                  backgroundColor: color,
                  bottom: 5,
                  left: 5,
                },
              ]}
            />
            {/* Water Level Label */}
            <Text style={styles.tankPercentLabel}>{Math.round(level)}%</Text>
          </View>
          <Text style={styles.tankLabel}>Water Level</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignSelf: "center",
    width: "98%",
    maxWidth: 420,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 10,
    paddingLeft: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    gap: 5,
  },
  infoLabel: {
    fontSize: 15,
    color: "#4f8cff",
    fontWeight: "600",
    marginLeft: 4,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
    marginLeft: 4,
  },
  tankVisualCol: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
    marginLeft: 8,
  },
  tankBody: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#f8fbff",
    borderWidth: 0,
    marginBottom: 2,
  },
  tankCap: {
    position: "absolute",
    top: -14,
    height: 14,
    backgroundColor: "#b0c4de",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 2,
  },
  tankOutline: {
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 4,
    borderColor: "#b0c4de",
    borderRadius: 16,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  tankWater: {
    position: "absolute",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 2,
  },
  tankPercentLabel: {
    position: "absolute",
    top: 18,
    left: 0,
    right: 0,
    textAlign: "center",
    fontWeight: "bold",
    color: "#4f8cff",
    fontSize: 26,
    zIndex: 3,
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tankLabel: {
    fontSize: 15,
    color: "#4f8cff",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 0,
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
