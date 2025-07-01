import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getWaterLevelColor } from "../constants";

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
});
