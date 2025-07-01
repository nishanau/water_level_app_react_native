import { useAppContext } from "@/AppContext";
import { COLORS, getWaterLevelColor } from "@/constants";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

// Define interfaces for our data types
interface HistoryDataItem {
  date: string;
  level: number;
}


export default function HistoryScreen() {
  const { historyData } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tank Level History</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          Tank Level History (Coming Soon...)
        </Text>
        <ScrollView>
          {historyData && historyData.length > 0 ? (
            historyData.map((item: HistoryDataItem, index: number) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.historyBarContainer}>
                  <View
                    style={[
                      styles.historyBar,
                      {
                        width: `${item.level}%`,
                        backgroundColor: getWaterLevelColor(item.level),
                      },
                    ]}
                  />
                  <Text style={styles.historyBarLabel}>{item.level}%</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyMessage}>No history data available</Text>
          )}
        </ScrollView>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: COLORS.danger }]}
            />
            <Text style={styles.legendText}>Critical (&lt; 20%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: COLORS.warning }]}
            />
            <Text style={styles.legendText}>Warning (20-40%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: COLORS.success }]}
            />
            <Text style={styles.legendText}>Good (&gt; 40%)</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average Level</Text>
            <Text style={styles.statValue}>
              {historyData && historyData.length > 0
                ? `${Math.round(
                    historyData.reduce(
                      (sum: number, item: HistoryDataItem) => sum + item.level,
                      0
                    ) / historyData.length
                  )}%`
                : "N/A"}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Lowest Level</Text>
            <Text style={styles.statValue}>
              {historyData && historyData.length > 0
                ? `${Math.min(
                    ...historyData.map((item: HistoryDataItem) => item.level)
                  )}%`
                : "N/A"}
              {}%
            </Text>
          </View>
        </View>
      </View>
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
  chartContainer: {
    flex: 1,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.text,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
  },
  historyDate: {
    width: 60,
  },
  historyDateText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  historyBarContainer: {
    flex: 1,
    marginLeft: 8,
  },
  historyBar: {
    height: 20,
    borderRadius: 4,
  },
  historyBarLabel: {
    position: "absolute",
    right: 8,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 20,
  },
  legendContainer: {
    marginVertical: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 40,
    color: COLORS.gray,
    fontSize: 16,
  },
});
