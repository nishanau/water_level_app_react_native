import { useAppContext } from "@/AppContext";
import { COLORS, getWaterLevelColor } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Define interfaces for our data types
interface HistoryDataItem {
  date: string;
  level: number;
}

// Custom water-themed colors
const AQUA_COLORS = {
  primary: "#0088cc", // Deeper blue
  secondary: "#4fb3ff", // Bright blue
  accent: "#00c6ff", // Cyan blue
  light: "#e1f5fe", // Very light blue
  medium: "#b3e5fc", // Light blue
  dark: "#0277bd", // Dark blue
  gradient: ["#e3f0ff", "#c2e9fb", "#f8fbff"], // Enhanced blue gradient
};

export default function HistoryScreen() {
  const { historyData, loadUserData } = useAppContext();
  const [refreshing, setRefreshing] = React.useState(false);

  // Calculate statistics from history data
  const stats = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return {
        average: 0,
        lowest: 0,
        highest: 0,
        mostRecent: 0,
        trend: "stable",
      };
    }

    const levels = historyData.map((item) => item.level);
    const average =
      levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const lowest = Math.min(...levels);
    const highest = Math.max(...levels);
    const mostRecent = historyData[0]?.level || 0;

    // Calculate trend over last 7 days
    const recent = historyData.slice(0, Math.min(7, historyData.length));
    const oldestRecent = recent[recent.length - 1]?.level || 0;
    const trend =
      mostRecent > oldestRecent
        ? "rising"
        : mostRecent < oldestRecent
        ? "falling"
        : "stable";

    return { average, lowest, highest, mostRecent, trend };
  }, [historyData]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "rising":
        return "trending-up";
      case "falling":
        return "trending-down";
      default:
        return "trending-neutral";
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "rising":
        return COLORS.success;
      case "falling":
        return COLORS.danger;
      default:
        return AQUA_COLORS.secondary;
    }
  };

  // Pull-to-refresh handler with blue tint
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.title}>Water Analytics</Text>
          <Text style={styles.subtitle}>Monitor your consumption patterns</Text>
        </View>
        <View style={styles.waterDrop}>
          <MaterialCommunityIcons
            name="water"
            size={24}
            color={AQUA_COLORS.primary}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AQUA_COLORS.primary, AQUA_COLORS.secondary]}
            tintColor={AQUA_COLORS.primary}
          />
        }
      >
        {/* Usage Statistics Card with water-themed styling */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Usage Overview</Text>

          <View style={styles.statsDashboard}>
            <View style={styles.statItemCard}>
              <MaterialCommunityIcons
                name="water-percent"
                size={22}
                color={AQUA_COLORS.primary}
              />
              <Text style={styles.statLabel}>Average Level</Text>
              <Text style={styles.statValue}>{Math.round(stats.average)}%</Text>
              <View style={styles.statBottomBar} />
            </View>

            <View style={styles.statItemCard}>
              <MaterialCommunityIcons
                name="arrow-down-bold"
                size={22}
                color={COLORS.danger}
              />
              <Text style={styles.statLabel}>Lowest</Text>
              <Text style={styles.statValue}>{stats.lowest}%</Text>
              <View
                style={[
                  styles.statBottomBar,
                  { backgroundColor: COLORS.danger },
                ]}
              />
            </View>

            <View style={styles.statItemCard}>
              <MaterialCommunityIcons
                name="arrow-up-bold"
                size={22}
                color={COLORS.success}
              />
              <Text style={styles.statLabel}>Highest</Text>
              <Text style={styles.statValue}>{stats.highest}%</Text>
              <View
                style={[
                  styles.statBottomBar,
                  { backgroundColor: COLORS.success },
                ]}
              />
            </View>

            <View style={styles.statItemCard}>
              <MaterialCommunityIcons
                name={getTrendIcon(stats.trend)}
                size={22}
                color={getTrendColor(stats.trend)}
              />
              <Text style={styles.statLabel}>7-Day Trend</Text>
              <Text
                style={[
                  styles.statValue,
                  { color: getTrendColor(stats.trend) },
                ]}
              >
                {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
              </Text>
              <View
                style={[
                  styles.statBottomBar,
                  { backgroundColor: getTrendColor(stats.trend) },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Water Level History Chart with enhanced styling */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={22}
              color={AQUA_COLORS.primary}
              style={styles.cardHeaderIcon}
            />
            <Text style={styles.cardTitle}>Water Level History</Text>
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: COLORS.danger }]}
              />
              <Text style={styles.legendText}>Critical (&lt; 20%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: COLORS.warning },
                ]}
              />
              <Text style={styles.legendText}>Warning (20-40%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: COLORS.success },
                ]}
              />
              <Text style={styles.legendText}>Good (&gt; 40%)</Text>
            </View>
          </View>

          {historyData && historyData.length > 0 ? (
            <View style={styles.chartContainer}>
              {historyData.map((item: HistoryDataItem, index: number) => (
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
              ))}
            </View>
          ) : (
            <View style={styles.emptyChartContainer}>
              <MaterialCommunityIcons
                name="water-off"
                size={48}
                color={AQUA_COLORS.medium}
              />
              <Text style={styles.emptyMessage}>No history data available</Text>
              <Text style={styles.emptySubMessage}>
                Data will appear as your tank levels are monitored
              </Text>
            </View>
          )}
        </View>

        {/* Consumption Insights Card with water drops */}
        <View style={styles.insightsCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="water-alert"
              size={22}
              color={AQUA_COLORS.primary}
              style={styles.cardHeaderIcon}
            />
            <Text style={styles.cardTitle}>Consumption Insights</Text>
          </View>

          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <MaterialCommunityIcons name="water" size={24} color="#fff" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Usage Efficiency</Text>
              <Text style={styles.insightText}>
                {stats.average > 60
                  ? "Your water levels have been well-maintained. Great job conserving water!"
                  : stats.average > 30
                  ? "Your water usage is moderate. Consider small adjustments to improve efficiency."
                  : "Your water levels have been running low. Consider adjusting your consumption habits."}
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <View
              style={[
                styles.insightIconContainer,
                { backgroundColor: AQUA_COLORS.secondary },
              ]}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color="#fff"
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Consumption Pattern</Text>
              <Text style={styles.insightText}>
                {stats.trend === "rising"
                  ? "Your water level is increasing. Recent refill or reduced usage detected."
                  : stats.trend === "falling"
                  ? "Your water level is decreasing as expected with normal consumption."
                  : "Your water usage has been consistent over the past week."}
              </Text>
            </View>
          </View>

          {/* Water saving tips section */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Water Saving Tips</Text>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons
                name="lightbulb-on"
                size={16}
                color={AQUA_COLORS.primary}
              />
              <Text style={styles.tipText}>
                Fix leaky taps to save up to 5,000L yearly
              </Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialCommunityIcons
                name="lightbulb-on"
                size={16}
                color={AQUA_COLORS.primary}
              />
              <Text style={styles.tipText}>
                Collect rainwater for garden irrigation
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 40,
  },
  scrollView: {
    flex: 1,
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
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 12,
    marginTop: 4,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: AQUA_COLORS.light,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: AQUA_COLORS.primary,
    marginBottom: 16,
  },
  statsDashboard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItemCard: {
    width: "48%",
    backgroundColor: "#f8fbff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(0,136,204,0.1)",
  },
  statBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: AQUA_COLORS.primary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 12,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: AQUA_COLORS.light,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  chartContainer: {
    marginTop: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 2,
  },
  historyDate: {
    width: 52,
  },
  historyDateText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "500",
  },
  historyBarContainer: {
    flex: 1,
    height: 22,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  historyBar: {
    height: "100%",
    borderRadius: 4,
  },
  historyBarLabel: {
    position: "absolute",
    right: 8,
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 22,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyMessage: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.gray,
    marginTop: 12,
  },
  emptySubMessage: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: "center",
  },
  insightsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 12,
    marginBottom: 24,
    shadowColor: COLORS.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: AQUA_COLORS.light,
  },
  insightItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AQUA_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: AQUA_COLORS.dark,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  tipsContainer: {
    marginTop: 16,
    backgroundColor: AQUA_COLORS.light,
    borderRadius: 12,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: AQUA_COLORS.dark,
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 6,
  },
});
