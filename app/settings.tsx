import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../AppContext';
import { SettingItem } from '../components';
import { COLORS } from '../constants';

export default function SettingsScreen() {
  const { 
    tankSize, 
    avgDailyUsage, 
    autoOrder, 
    lowWaterThreshold, 
    notificationPreferences, 
    preferredSupplier,
    userProfile,
    saveSettings,
    updateUserProfile
  } = useAppContext();
  
  // Local state to track changes
  const [localTankSize, setLocalTankSize] = useState(tankSize.toString());
  const [localAvgUsage, setLocalAvgUsage] = useState(avgDailyUsage.toString());
  const [localThreshold, setLocalThreshold] = useState(lowWaterThreshold.toString());
  const [localAutoOrder, setLocalAutoOrder] = useState(autoOrder);
  const [localPreferredSupplier, setLocalPreferredSupplier] = useState(preferredSupplier);
  const [localNotifications, setLocalNotifications] = useState({...notificationPreferences});
  
  // User profile fields
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  
  // Handle saving tank settings
  const saveTankSettings = () => {
    const tankSizeNum = parseInt(localTankSize);
    const avgUsageNum = parseInt(localAvgUsage);
    const thresholdNum = parseInt(localThreshold);
    
    // Validate inputs
    if (isNaN(tankSizeNum) || tankSizeNum <= 0) {
      Alert.alert('Invalid Input', 'Tank size must be a positive number');
      return;
    }
    
    if (isNaN(avgUsageNum) || avgUsageNum <= 0) {
      Alert.alert('Invalid Input', 'Average usage must be a positive number');
      return;
    }
    
    if (isNaN(thresholdNum) || thresholdNum < 0 || thresholdNum > 100) {
      Alert.alert('Invalid Input', 'Threshold must be between 0 and 100');
      return;
    }
    
    saveSettings({
      tankSize: tankSizeNum,
      avgDailyUsage: avgUsageNum,
      lowWaterThreshold: thresholdNum
    });
    
    Alert.alert('Success', 'Tank settings saved successfully');
  };
  
  // Handle saving auto-order settings
  const saveOrderSettings = () => {
    saveSettings({
      autoOrder: localAutoOrder,
      preferredSupplier: localPreferredSupplier
    });
    
    Alert.alert('Success', 'Order settings saved successfully');
  };
  
  // Handle saving notification preferences
  const saveNotificationSettings = () => {
    saveSettings({
      notificationPreferences: localNotifications
    });
    
    Alert.alert('Success', 'Notification settings saved successfully');
  };
  
  // Handle saving user profile
  const saveUserProfile = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    const success = await updateUserProfile({
      name,
      email,
      phone
    });
    
    if (success) {
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update profile');
    }
  };
    // Toggle notification settings
  const toggleNotification = (type: string): void => {
    setLocalNotifications((prev: Record<string, boolean>) => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tank Settings</Text>
          
          <SettingItem title="Tank Size">
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={localTankSize}
                onChangeText={setLocalTankSize}
                keyboardType="numeric"
                placeholder="Enter tank size"
              />
              <Text style={styles.inputLabel}>Liters</Text>
            </View>
          </SettingItem>
          
          <SettingItem title="Average Daily Usage">
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={localAvgUsage}
                onChangeText={setLocalAvgUsage}
                keyboardType="numeric"
                placeholder="Enter average usage"
              />
              <Text style={styles.inputLabel}>Liters/day</Text>
            </View>
          </SettingItem>
          
          <SettingItem title="Low Water Threshold">
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={localThreshold}
                onChangeText={setLocalThreshold}
                keyboardType="numeric"
                placeholder="Enter threshold"
              />
              <Text style={styles.inputLabel}>%</Text>
            </View>
            <Text style={styles.helperText}>
              Auto-order will be triggered when water level falls below this threshold
            </Text>
          </SettingItem>
          
          <TouchableOpacity style={styles.saveButton} onPress={saveTankSettings}>
            <Text style={styles.saveButtonText}>Save Tank Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Settings</Text>
          
          <SettingItem title="Auto-Order">
            <Switch
              value={localAutoOrder}
              onValueChange={setLocalAutoOrder}
              trackColor={{ false: '#d1d1d1', true: COLORS.secondary }}
              thumbColor={localAutoOrder ? COLORS.primary : '#f4f3f4'}
            />
          </SettingItem>
          
          <SettingItem title="Preferred Supplier">
            <TextInput
              style={styles.input}
              value={localPreferredSupplier}
              onChangeText={setLocalPreferredSupplier}
              placeholder="Enter supplier name"
            />
          </SettingItem>
          
          <TouchableOpacity style={styles.saveButton} onPress={saveOrderSettings}>
            <Text style={styles.saveButtonText}>Save Order Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <SettingItem title="Push Notifications">
            <Switch
              value={localNotifications.push}
              onValueChange={() => toggleNotification('push')}
              trackColor={{ false: '#d1d1d1', true: COLORS.secondary }}
              thumbColor={localNotifications.push ? COLORS.primary : '#f4f3f4'}
            />
          </SettingItem>
          
          <SettingItem title="SMS Notifications">
            <Switch
              value={localNotifications.sms}
              onValueChange={() => toggleNotification('sms')}
              trackColor={{ false: '#d1d1d1', true: COLORS.secondary }}
              thumbColor={localNotifications.sms ? COLORS.primary : '#f4f3f4'}
            />
          </SettingItem>
          
          <SettingItem title="Email Notifications">
            <Switch
              value={localNotifications.email}
              onValueChange={() => toggleNotification('email')}
              trackColor={{ false: '#d1d1d1', true: COLORS.secondary }}
              thumbColor={localNotifications.email ? COLORS.primary : '#f4f3f4'}
            />
          </SettingItem>
          
          <TouchableOpacity style={styles.saveButton} onPress={saveNotificationSettings}>
            <Text style={styles.saveButtonText}>Save Notification Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <SettingItem title="Full Name">
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </SettingItem>
          
          <SettingItem title="Email">
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </SettingItem>
          
          <SettingItem title="Phone Number">
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </SettingItem>
          
          <TouchableOpacity style={styles.saveButton} onPress={saveUserProfile}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Water Tank Monitor v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 Water Monitor Inc.</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray,
    width: 80,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  appInfo: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.gray,
  },
  appCopyright: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
});
