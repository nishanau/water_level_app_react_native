import { useAppContext } from "@/AppContext";
import { SettingItem } from "@/components";
import { COLORS } from "@/constants";
import apiService from "@/services/apiService";
import supplierService from "@/services/supplierService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Tank Settings Sub-Screen
function TankSettingsScreen({ onBack }: { onBack: () => void }) {
  const {
    tankSize,
    setTankSize,
    setLowWaterThreshold,
    setAvgDailyUsage,
    avgDailyUsage,
    lowWaterThreshold,
    user,
  } = useAppContext();

  // Local state to track changes
  const [localTankSize, setLocalTankSize] = useState(tankSize.toString());
  const [localAvgUsage, setLocalAvgUsage] = useState(avgDailyUsage.toString());
  const [localThreshold, setLocalThreshold] = useState(
    lowWaterThreshold.toString()
  );

  // Handle saving tank settings
  const saveTankSettings = async () => {
    const tankSizeNum = parseInt(localTankSize);
    const avgUsageNum = parseInt(localAvgUsage);
    const thresholdNum = parseInt(localThreshold);

    // Validate inputs
    if (isNaN(tankSizeNum) || tankSizeNum <= 0) {
      Alert.alert("Invalid Input", "Tank size must be a positive number");
      return;
    }

    if (isNaN(avgUsageNum) || avgUsageNum <= 0) {
      Alert.alert("Invalid Input", "Average usage must be a positive number");
      return;
    }

    if (isNaN(thresholdNum) || thresholdNum < 0 || thresholdNum > 100) {
      Alert.alert("Invalid Input", "Threshold must be between 0 and 100");
      return;
    }

    const response = await apiService.patchFields("tanks", user.tankIds[0], {
      capacity: tankSizeNum,
      avgDailyUsage: avgUsageNum,
      lowWaterThreshold: thresholdNum,
    });

    if (response) {
      setTankSize(tankSizeNum);
      setAvgDailyUsage(avgUsageNum);
      setLowWaterThreshold(thresholdNum);
    }

    Alert.alert("Success", "Tank settings saved successfully");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Tank Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
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
              Auto-order will be triggered when water level falls below this
              threshold
            </Text>
          </SettingItem>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveTankSettings}
          >
            <Text style={styles.saveButtonText}>Save Tank Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Order Settings Sub-Screen
function OrderSettingsScreen({ onBack }: { onBack: () => void }) {
  interface Supplier {
    id: string;
    company: string;
  }
  const {
    autoOrder,
    preferredSupplier,
    setPreferredSupplier,
    setAutoOrder,
    user,
  } = useAppContext();

  const [supplierList, setSupplierList] = useState<
    { id: string; companyName: string }[]
  >([]);
  // Local state to track changes
  const [localAutoOrder, setLocalAutoOrder] = useState(autoOrder);
  const [localPreferredSupplier, setLocalPreferredSupplier] =
    useState(preferredSupplier);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const suppliers = await supplierService.getSuppliers();
      const formattedSuppliers = suppliers.map((supplier) => ({
        id: supplier._id,
        companyName: supplier.company,
      }));

      setSupplierList(formattedSuppliers);
    };

    fetchSuppliers();
  }, []);

  // Handle savin g order settings
  const saveOrderSettings = async () => {
    if (
      localPreferredSupplier === "" ||
      localAutoOrder === "" ||
      localAutoOrder === null ||
      localPreferredSupplier === null
    ) {
      Alert.alert("Missing Fields", "Please select a preferred supplier");
      return;
    }
    try {
      await apiService.patchFields("users", user.id, {
        autoOrder: localAutoOrder,
        preferredSupplier: localPreferredSupplier,
      });
      // This code only runs if no error was thrown
      setAutoOrder(localAutoOrder);
      setPreferredSupplier(localPreferredSupplier);
      Alert.alert("Success", "Order settings saved successfully");
    } catch (error) {
      // This code runs when patchFields throws an error
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Order Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <SettingItem title="Auto-Order">
            <Switch
              value={localAutoOrder}
              onValueChange={setLocalAutoOrder}
              trackColor={{ false: "#d1d1d1", true: COLORS.secondary }}
              thumbColor={localAutoOrder ? COLORS.primary : "#f4f3f4"}
            />
          </SettingItem>

          <SettingItem title="Preferred Supplier">
            <View style={styles.dropdownContainer}>
              <Picker
                selectedValue={localPreferredSupplier}
                onValueChange={(itemValue) =>
                  setLocalPreferredSupplier(itemValue)
                }
                style={[styles.dropdown, styles.dropdownText]}
              >
                <Picker.Item
                  label="Select Supplier"
                  value=""
                  style={styles.dropdownPlaceholder}
                />
                {supplierList.map((supplier) => (
                  <Picker.Item
                    key={supplier.id}
                    label={supplier.companyName}
                    value={supplier.id}
                    style={styles.dropdownText}
                  />
                ))}
              </Picker>
            </View>
          </SettingItem>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveOrderSettings}
          >
            <Text style={styles.saveButtonText}>Save Order Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Notification Settings Sub-Screen
function NotificationSettingsScreen({ onBack }: { onBack: () => void }) {
  const { notificationPreferences } = useAppContext();

  // Local state to track changes
  const [localNotifications, setLocalNotifications] = useState({
    ...notificationPreferences,
  });
  // Toggle notification settings
  const toggleNotification = (type: string) => {
    setLocalNotifications((prev: any) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Handle saving notification preferences
  const saveNotificationSettings = () => {
    Alert.alert("Success", "Notification settings saved successfully");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <SettingItem title="Push Notifications">
            <Switch
              value={localNotifications.push}
              onValueChange={() => toggleNotification("push")}
              trackColor={{ false: "#d1d1d1", true: COLORS.secondary }}
              thumbColor={localNotifications.push ? COLORS.primary : "#f4f3f4"}
            />
          </SettingItem>

          <SettingItem title="SMS Notifications">
            <Switch
              value={localNotifications.sms}
              onValueChange={() => toggleNotification("sms")}
              trackColor={{ false: "#d1d1d1", true: COLORS.secondary }}
              thumbColor={localNotifications.sms ? COLORS.primary : "#f4f3f4"}
            />
          </SettingItem>

          <SettingItem title="Email Notifications">
            <Switch
              value={localNotifications.email}
              onValueChange={() => toggleNotification("email")}
              trackColor={{ false: "#d1d1d1", true: COLORS.secondary }}
              thumbColor={localNotifications.email ? COLORS.primary : "#f4f3f4"}
            />
          </SettingItem>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveNotificationSettings}
          >
            <Text style={styles.saveButtonText}>
              Save Notification Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Account Settings Sub-Screen
function AccountSettingsScreen({ onBack }: { onBack: () => void }) {
  const { user, updateUserProfile } = useAppContext();

  // User profile fields
  const [name, setName] = useState(
    `${user.firstName}` + ` ` + `${user.lastName}`
  );
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phoneNumber);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle saving user profile
  const saveUserProfile = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    const success = await updateUserProfile({
      name,
      email,
      phone,
    });

    if (success) {
      Alert.alert("Success", "Profile updated successfully");
    } else {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // Handle password reset
  const handleResetPassword = () => {
    // Validate password
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // In a real app, we would call an API to reset password
    Alert.alert("Success", "Password updated successfully");
    setShowResetPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
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

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: COLORS.secondary, marginTop: 24 },
            ]}
            onPress={() => setShowResetPasswordModal(true)}
          >
            <Text style={styles.saveButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal
        visible={showResetPasswordModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>

            <TextInput
              style={[styles.input, { marginVertical: 8 }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              secureTextEntry
            />

            <TextInput
              style={[styles.input, { marginVertical: 8 }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              secureTextEntry
            />

            <TextInput
              style={[styles.input, { marginVertical: 8 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowResetPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleResetPassword}
              >
                <Text style={styles.confirmButtonText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Payment Settings Sub-Screen
function PaymentSettingsScreen({ onBack }: { onBack: () => void }) {
  // In a real app, we would fetch payment methods from an API
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "1",
      type: "credit_card",
      last4: "4242",
      brand: "Visa",
      expMonth: 12,
      expYear: 2026,
      isDefault: true,
    },
    {
      id: "2",
      type: "bank_account",
      last4: "6789",
      bankName: "Chase",
      isDefault: false,
    },
  ]);

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  // Add a new payment method
  const addPaymentMethod = () => {
    // Validate inputs
    if (cardNumber.length < 16) {
      Alert.alert("Invalid Input", "Please enter a valid card number");
      return;
    }

    if (cardExpiry.length < 5) {
      Alert.alert("Invalid Input", "Please enter a valid expiry date (MM/YY)");
      return;
    }

    if (cardCvc.length < 3) {
      Alert.alert("Invalid Input", "Please enter a valid CVC");
      return;
    }

    if (!cardholderName) {
      Alert.alert("Invalid Input", "Please enter the cardholder name");
      return;
    }

    // In a real app, we would call an API to add a payment method
    const newPaymentMethod = {
      id: Date.now().toString(),
      type: "credit_card",
      last4: cardNumber.slice(-4),
      brand: "Visa", // This would be determined by the API
      expMonth: parseInt(cardExpiry.split("/")[0]),
      expYear: parseInt("20" + cardExpiry.split("/")[1]),
      isDefault: false,
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setShowAddPaymentModal(false);

    // Reset form
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardholderName("");

    Alert.alert("Success", "Payment method added successfully");
  };
  // Set a payment method as default
  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods((prevMethods) =>
      prevMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };
  // Remove a payment method
  const removePaymentMethod = (id: string) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPaymentMethods((prevMethods) =>
              prevMethods.filter((method) => method.id !== id)
            );
            Alert.alert("Success", "Payment method removed");
          },
        },
      ]
    );
  };
  // Format card number with spaces
  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\s+/g, "");
    let formatted = "";

    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += cleaned[i];
    }

    return formatted;
  };
  // Format card expiry with slash
  const formatExpiry = (text: string): string => {
    const cleaned = text.replace(/\D+/g, "");
    if (cleaned.length <= 2) {
      return cleaned;
    }
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethodItem}>
              <View style={styles.paymentMethodIcon}>
                <MaterialCommunityIcons
                  name={method.type === "credit_card" ? "credit-card" : "bank"}
                  size={24}
                  color={COLORS.primary}
                />
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>

              <View style={styles.paymentMethodDetails}>
                {method.type === "credit_card" ? (
                  <>
                    <Text style={styles.paymentMethodTitle}>
                      {method.brand} •••• {method.last4}
                    </Text>
                    <Text style={styles.paymentMethodSubtitle}>
                      Expires {method.expMonth}/{method.expYear}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.paymentMethodTitle}>
                      {method.bankName} •••• {method.last4}
                    </Text>
                    <Text style={styles.paymentMethodSubtitle}>
                      Bank Account
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.paymentMethodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.paymentMethodAction}
                    onPress={() => setDefaultPaymentMethod(method.id)}
                  >
                    <Text style={styles.paymentMethodActionText}>
                      Set Default
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.paymentMethodAction, { marginLeft: 8 }]}
                  onPress={() => removePaymentMethod(method.id)}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color={COLORS.danger}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, { marginTop: 16 }]}
            onPress={() => setShowAddPaymentModal(true)}
          >
            <Text style={styles.saveButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddPaymentModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: "90%" }]}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>

            <TextInput
              style={[styles.input, { marginVertical: 8 }]}
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="Cardholder Name"
            />
            <TextInput
              style={[styles.input, { marginVertical: 8 }]}
              value={cardNumber}
              onChangeText={(text) => {
                if (text.replace(/\s+/g, "").length <= 16) {
                  setCardNumber(formatCardNumber(text));
                }
              }}
              placeholder="Card Number"
              keyboardType="numeric"
              maxLength={19} // 16 digits + 3 spaces
            />

            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={[
                  styles.input,
                  { marginVertical: 8, flex: 1, marginRight: 8 },
                ]}
                value={cardExpiry}
                onChangeText={(text) => {
                  if (text.replace(/\D+/g, "").length <= 4) {
                    setCardExpiry(formatExpiry(text));
                  }
                }}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5} // MM/YY
              />
              <TextInput
                style={[styles.input, { marginVertical: 8, flex: 1 }]}
                value={cardCvc}
                onChangeText={(text) => {
                  if (/^\d*$/.test(text) && text.length <= 4) {
                    setCardCvc(text);
                  }
                }}
                placeholder="CVC"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addPaymentMethod}
              >
                <Text style={styles.confirmButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Main Settings Screen
export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAppContext();
  const [activeScreen, setActiveScreen] = useState("main");
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  // Navigate to sub-screens
  const navigateToScreen = (screen: string) => {
    setActiveScreen(screen);
  };

  // Handle back button
  const handleBack = () => {
    setActiveScreen("main");
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout(); // Use the logout function from AppContext
      setShowSignOutModal(false);
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  // Render different screens based on navigation state
  switch (activeScreen) {
    case "tankSettings":
      return <TankSettingsScreen onBack={handleBack} />;
    case "orderSettings":
      return <OrderSettingsScreen onBack={handleBack} />;
    case "notificationSettings":
      return <NotificationSettingsScreen onBack={handleBack} />;
    case "accountSettings":
      return <AccountSettingsScreen onBack={handleBack} />;
    case "paymentSettings":
      return <PaymentSettingsScreen onBack={handleBack} />;
    default:
      // Main settings menu
      return (
        <SafeAreaView style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Tank Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("tankSettings")}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name="water-pump"
                  size={24}
                  color={COLORS.primary}
                  style={styles.menuIcon}
                />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Tank Settings</Text>
                  <Text style={styles.menuItemDescription}>
                    Size, usage, threshold
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>

            {/* Order Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("orderSettings")}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={24}
                  color={COLORS.primary}
                  style={styles.menuIcon}
                />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Order Settings</Text>
                  <Text style={styles.menuItemDescription}>
                    Auto-order, preferred supplier
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>

            {/* Notification Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("notificationSettings")}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name="bell"
                  size={24}
                  color={COLORS.primary}
                  style={styles.menuIcon}
                />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Notifications</Text>
                  <Text style={styles.menuItemDescription}>
                    Push, SMS, email
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>

            {/* Account Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("accountSettings")}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color={COLORS.primary}
                  style={styles.menuIcon}
                />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Account</Text>
                  {user && (
                    <Text style={styles.menuItemDescription}>
                      {user.firstName} • {user.lastName} • {user.email}
                    </Text>
                  )}
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>

            {/* Payment Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateToScreen("paymentSettings")}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name="credit-card"
                  size={24}
                  color={COLORS.primary}
                  style={styles.menuIcon}
                />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Payment Methods</Text>
                  <Text style={styles.menuItemDescription}>
                    Manage payment options
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity
              style={[styles.menuItem, styles.signOutButton]}
              onPress={() => setShowSignOutModal(true)}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color={COLORS.danger}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuItemTitle, { color: COLORS.danger }]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.appInfo}>
              <Text style={styles.appVersion}>Water Tank Monitor v1.0.0</Text>
              <Text style={styles.appCopyright}>© 2025 Nishan Shrestha.</Text>
            </View>
          </ScrollView>

          {/* Sign Out Confirmation Modal */}
          <Modal
            visible={showSignOutModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sign Out</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to sign out?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowSignOutModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleSignOut}
                  >
                    <Text style={styles.confirmButtonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      );
  }
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
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.text,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
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
  dropdown: {
    height: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dropdownContainer: {
    marginVertical: 8,
    width: "90%",
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dropdownPlaceholder: {
    color: COLORS.gray,
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
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },
  // Menu items for main settings screen
  menuItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  signOutButton: {
    marginTop: 24,
    backgroundColor: COLORS.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 24,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  // Payment method styles
  paymentMethodItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  defaultBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "bold",
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  paymentMethodActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodAction: {
    padding: 8,
  },
  paymentMethodActionText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  appInfo: {
    alignItems: "center",
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
