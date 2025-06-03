import { useAppContext } from '@/AppContext';
import { CircularProgressIndicator } from '@/components';
import { calculateDaysRemaining, COLORS, formatDate } from '@/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    waterLevel, 
    tankSize, 
    avgDailyUsage, 
    nextDelivery, 
    autoOrder, 
    setAutoOrder, 
    placeOrder, 
    loading,
    saveSettings
  } = useAppContext();
  
  // Calculate days remaining
  const daysRemaining = calculateDaysRemaining(waterLevel, tankSize, avgDailyUsage);
  
  // Toggle auto-order
  const toggleAutoOrder = () => {
    const newAutoOrderValue = !autoOrder;
    setAutoOrder(newAutoOrderValue);
    saveSettings({ autoOrder: newAutoOrderValue });
  };
  
  // Place manual order
  const handlePlaceOrder = async () => {
    await placeOrder();
  };
  
  // View order history
  const viewOrderHistory = () => {
    router.push('/orders');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Water Tank Monitor</Text>
        </View>
        
        <View style={styles.tankContainer}>
          <CircularProgressIndicator level={waterLevel} size={250} />
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.primary} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Estimated Days Remaining</Text>
              <Text style={styles.infoValue}>{daysRemaining} days</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="truck-delivery" size={24} color={COLORS.primary} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Next Scheduled Delivery</Text>
              <Text style={styles.infoValue}>{nextDelivery ? formatDate(nextDelivery) : 'None'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.autoOrderContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Auto-Ordering</Text>
            <Switch
              value={autoOrder}
              onValueChange={toggleAutoOrder}
              trackColor={{ false: '#d1d1d1', true: COLORS.secondary }}
              thumbColor={autoOrder ? COLORS.primary : '#f4f3f4'}
            />
          </View>
          <Text style={styles.switchDescription}>
            {autoOrder 
              ? 'Auto-ordering is enabled. We\'ll place orders automatically when water level is low.'
              : 'Auto-ordering is disabled. You need to place orders manually.'}
          </Text>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.disabledButton]} 
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            <MaterialCommunityIcons name="water" size={20} color="white" />
            <Text style={styles.actionButtonText}>Place Manual Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={viewOrderHistory}
          >
            <MaterialCommunityIcons name="history" size={20} color="white" />
            <Text style={styles.actionButtonText}>View Order History</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tank Size</Text>
            <Text style={styles.statValue}>{tankSize} L</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg. Daily Usage</Text>
            <Text style={styles.statValue}>{avgDailyUsage} L</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tankContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    marginVertical: 20,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  autoOrderContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginVertical: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  switchDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  actionButtonsContainer: {
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  quickStats: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
