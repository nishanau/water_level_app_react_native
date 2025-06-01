import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../AppContext';
import { OrderItem } from '../components';
import { COLORS } from '../constants';

// Define interfaces for our data types
interface Order {
  id: string;
  date: string;
  status: string;
  amount: number;
  price: number;
  deliveryDate: string;
  invoice: string;
}

interface DateTimePickerEvent {
  type: string;
  nativeEvent: {
    timestamp?: number;
  };
}

export default function OrdersScreen() {
  const { orders, cancelOrder, rescheduleOrder } = useAppContext(); // Removed unused 'loading' variable
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  
  // Filter orders by status
  const upcomingOrders = orders.filter((order: Order) => 
    order.status === 'Scheduled' || order.status === 'In Transit'
  );
  
  const pastOrders = orders.filter((order: Order) => 
    order.status === 'Delivered' || order.status === 'Cancelled'
  );
  
  // Handle order cancellation
  const handleCancelOrder = async (orderId: string): Promise<void> => {
    await cancelOrder(orderId);
  };
  
  // Handle order rescheduling
  const handleReschedule = (order: Order): void => {
    setSelectedOrder(order);
    const date = new Date(order.deliveryDate);
    setSelectedDate(date);
    setDatePickerVisible(true);
  };
  
  // Handle date change
  const handleDateChange = (event: DateTimePickerEvent, date?: Date): void => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }
    
    if (date) {
      setSelectedDate(date);
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(true);
      } else {
        // On Android, directly reschedule when a date is selected
        if (selectedOrder) {
          rescheduleOrder(selectedOrder.id, date);
          setSelectedOrder(null);
        }
      }
    } else {
      // User cancelled
      setSelectedOrder(null);
    }
  };
  
  // Confirm rescheduling (for iOS)
  const confirmRescheduling = (): void => {
    if (selectedOrder) {
      rescheduleOrder(selectedOrder.id, selectedDate);
      setShowDatePicker(false);
      setSelectedOrder(null);
    }
  };
  
  // Cancel rescheduling (for iOS)
  const cancelRescheduling = (): void => {
    setShowDatePicker(false);
    setSelectedOrder(null);
  };
    // Render header for each section
  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count} orders</Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Water Orders</Text>
      </View>
      
      <FlatList
        data={[]}
        ListHeaderComponent={() => (
          <>
            {renderSectionHeader('Upcoming Orders', upcomingOrders.length)}
            
            {upcomingOrders.length > 0 ? (
              upcomingOrders.map((order: Order) => (
                <OrderItem 
                  key={order.id} 
                  order={order} 
                  onCancel={handleCancelOrder}
                  onReschedule={handleReschedule}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={48} color={COLORS.gray} />
                <Text style={styles.emptyText}>No upcoming orders</Text>
                <Text style={styles.emptySubtext}>Your next order will appear here</Text>
              </View>
            )}
            
            {renderSectionHeader('Past Orders', pastOrders.length)}
            
            {pastOrders.length > 0 ? (
              pastOrders.map((order: Order) => (
                <OrderItem 
                  key={order.id} 
                  order={order}
                  onCancel={undefined}
                  onReschedule={undefined}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="history" size={48} color={COLORS.gray} />
                <Text style={styles.emptyText}>No past orders</Text>
              </View>
            )}
          </>
        )}
        renderItem={() => null}
      />
      
      {/* Date picker for Android */}
      {Platform.OS === 'android' && datePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {/* Date picker modal for iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={datePickerVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Reschedule Delivery
              </Text>
              
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
              
              {showDatePicker && (
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelRescheduling}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmRescheduling}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
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
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
});
