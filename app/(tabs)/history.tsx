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
  View
} from "react-native";

// Define interfaces for our data types
interface HistoryDataItem {
  date: string;
  level: number;
}

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
        trend: "stable"
      };
    }

    const levels = historyData.map(item => item.level);
    const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const lowest = Math.min(...levels);
    const highest = Math.max(...levels);
    const mostRecent = historyData[0]?.level || 0;
    
    // Calculate trend over last 7 days
    const recent = historyData.slice(0, Math.min(7, historyData.length));
    const oldestRecent = recent[recent.length - 1]?.level || 0;
    const trend = mostRecent > oldestRecent 
      ? "rising" 
      : mostRecent < oldestRecent 
        ? "falling" 
        : "stable";
    
    return { average, lowest, highest, mostRecent, trend };
  }, [historyData]);

  const getTrendIcon = (trend) => {
    switch(trend) {
      case "rising": return "trending-up";
      case "falling": return "trending-down";
      default: return "trending-neutral";
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case "rising": return COLORS.success;
      case "falling": return COLORS.danger;
      default: return COLORS.secondary;
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#e3f0ff", "#f8fbff", "#fff"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Usage Analytics</Text>
        <Text style={styles.subtitle}>Monitor your water consumption patterns</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Usage Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Usage Overview</Text>
          
          <View style={styles.statsDashboard}>
            <View style={styles.statItemCard}>
              <MaterialCommunityIcons name="water-percent" size={22} color={COLORS.primary} />
              <Text style={styles.statLabel}>Average Level</Text>
              <Text style={styles.statValue}>{Math.round(stats.average)}%</Text>
            </View>
            
            <View style={styles.statItemCard}>
              <MaterialCommunityIcons name="arrow-down-bold" size={22} color={COLORS.danger} />
              <Text style={styles.statLabel}>Lowest</Text>
              <Text style={styles.statValue}>{stats.lowest}%</Text>
            </View>
            
            <View style={styles.statItemCard}>
              <MaterialCommunityIcons name="arrow-up-bold" size={22} color={COLORS.success} />
              <Text style={styles.statLabel}>Highest</Text>
              <Text style={styles.statValue}>{stats.highest}%</Text>
            </View>
            
            <View style={styles.statItemCard}>
              <MaterialCommunityIcons name={getTrendIcon(stats.trend)} size={22} color={getTrendColor(stats.trend)} />
              <Text style={styles.statLabel}>7-Day Trend</Text>
              <Text style={[styles.statValue, { color: getTrendColor(stats.trend) }]}>
                {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Water Level History Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Water Level History</Text>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.legendText}>Critical (&lt; 20%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>Warning (20-40%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
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
              <MaterialCommunityIcons name="chart-timeline-variant" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyMessage}>No history data available</Text>
              <Text style={styles.emptySubMessage}>Data will appear as your tank levels are monitored</Text>
            </View>
          )}
        </View>

        {/* Consumption Insights Card */}
        <View style={styles.insightsCard}>
          <Text style={styles.cardTitle}>Consumption Insights</Text>
          
          <View style={styles.insightItem}>
            <MaterialCommunityIcons name="water-alert" size={24} color={COLORS.primary} style={styles.insightIcon} />
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
            <MaterialCommunityIcons name="chart-line" size={24} color={COLORS.primary} style={styles.insightIcon} />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
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
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.primary,
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
  },
  insightItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});
