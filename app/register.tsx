import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "../constants";
import authService from "../services/authService";

// Custom water-themed colors to match other screens
const AQUA_COLORS = {
  primary: "#0088cc", // Deeper blue
  secondary: "#4fb3ff", // Bright blue
  accent: "#00c6ff", // Cyan blue
  light: "#e1f5fe", // Very light blue
  medium: "#b3e5fc", // Light blue
  dark: "#0277bd", // Dark blue
  gradient: ["#e3f0ff", "#c2e9fb", "#f8fbff"], // Enhanced blue gradient
};

type TankInput = {
  deviceId: string;
  capacity: string;
  avgDailyUsage: string;
  lowWaterThreshold: string;
};

const steps = ["Account", "Address", "Tanks", "Review"];
const AU_STATES = [
  { label: "New South Wales", value: "NSW" },
  { label: "Victoria", value: "VIC" },
  { label: "Queensland", value: "QLD" },
  { label: "Western Australia", value: "WA" },
  { label: "South Australia", value: "SA" },
  { label: "Tasmania", value: "TAS" },
  { label: "Australian Capital Territory", value: "ACT" },
  { label: "Northern Territory", value: "NT" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  // Step 1: Account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Address
  const [address, setAddress] = useState({
    street: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Australia",
  });

  // Step 3: Tanks
  // Fix: Initialize tanks as an array with a single item, not as an object
  const [tanks, setTanks] = useState<TankInput[]>([
    { deviceId: "", capacity: "", avgDailyUsage: "", lowWaterThreshold: "" },
  ]);

  // Refs for input fields to enable auto-focus
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const streetRef = useRef(null);
  const street2Ref = useRef(null);
  const cityRef = useRef(null);
  const postalCodeRef = useRef(null);

  // Validation
  const validateStep = () => {
    if (step === 0) {
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword ||
        !phoneNumber.trim()
      ) {
        Alert.alert("Error", "Please fill in all required fields");
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return false;
      }
      if (password.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters long");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return false;
      }
      // Australian phone validation: 10 digits, starts with 0
      const phoneRegex = /^0[2-478]\d{8}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
        Alert.alert(
          "Error",
          "Please enter a valid Australian phone number (e.g. 0412 345 678)"
        );
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (
        !address.street.trim() ||
        !address.city.trim() ||
        !address.state ||
        !address.postalCode.trim()
      ) {
        Alert.alert("Error", "Please fill in all address fields");
        return false;
      }
      if (!/^\d{4}$/.test(address.postalCode)) {
        Alert.alert("Error", "Please enter a valid 4-digit postal code");
        return false;
      }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < tanks.length; i++) {
        const t = tanks[i];
        if (
          !t.deviceId.trim() ||
          !t.capacity.trim() ||
          !t.avgDailyUsage.trim() ||
          !t.lowWaterThreshold.trim()
        ) {
          Alert.alert("Error", `Please fill all fields for tank ${i + 1}`);
          return false;
        }
        if (isNaN(Number(t.capacity)) || Number(t.capacity) <= 0) {
          Alert.alert(
            "Error",
            `Tank ${i + 1}: Capacity must be a positive number`
          );
          return false;
        }
        if (isNaN(Number(t.avgDailyUsage)) || Number(t.avgDailyUsage) <= 0) {
          Alert.alert(
            "Error",
            `Tank ${i + 1}: Avg Daily Usage must be a positive number`
          );
          return false;
        }
        if (
          isNaN(Number(t.lowWaterThreshold)) ||
          Number(t.lowWaterThreshold) < 0 ||
          Number(t.lowWaterThreshold) > 100
        ) {
          Alert.alert(
            "Error",
            `Tank ${i + 1}: Low Water Threshold must be 0-100`
          );
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleAddTank = () => {
    setTanks([
      ...tanks,
      { deviceId: "", capacity: "", avgDailyUsage: "", lowWaterThreshold: "" },
    ]);
  };

  const handleRemoveTank = (idx: number) => {
    if (tanks.length === 1) return;
    setTanks(tanks.filter((_, i) => i !== idx));
  };

  const handleTankChange = (
    idx: number,
    field: keyof TankInput,
    value: string
  ) => {
    setTanks((prev) =>
      prev.map((tank, i) => (i === idx ? { ...tank, [field]: value } : tank))
    );
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.replace(/\s/g, ""),
        role: "customer",
        address: {
          street: address.street.trim(),
          street2: address.street2.trim(),
          city: address.city.trim(),
          state: address.state,
          postalCode: address.postalCode.trim(),
          country: "Australia",
        },
        tanks: tanks.map((t) => ({
          deviceId: t.deviceId.trim(),
          capacity: Number(t.capacity),
          avgDailyUsage: Number(t.avgDailyUsage),
          lowWaterThreshold: Number(t.lowWaterThreshold),
        })),
      };
      const res = await authService.register(userData);
      console.log("response", res);
      Alert.alert("Success", `${res.data.message}`);
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Stepper UI
  const renderStepper = () => (
    <View style={styles.stepperRow}>
      {steps.map((label, idx) => (
        <View key={label} style={styles.stepperItem}>
          <View
            style={[
              styles.stepCircle,
              idx === step
                ? styles.stepCircleActive
                : idx < step
                ? styles.stepCircleCompleted
                : {},
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                idx === step
                  ? styles.stepNumberActive
                  : idx < step
                  ? styles.stepNumberCompleted
                  : {},
              ]}
            >
              {idx + 1}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              idx === step ? styles.stepLabelActive : {},
            ]}
          >
            {label}
          </Text>
          {idx < steps.length - 1 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  // Step screens
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput
              ref={lastNameRef}
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoComplete="family-name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Email (e.g. john@email.com)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
            <View style={styles.passwordInputRow}>
              <TextInput
                ref={passwordRef}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password (min 8 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword((v) => !v)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputRow}>
              <TextInput
                ref={confirmPasswordRef}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => phoneNumberRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword((v) => !v)}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              ref={phoneNumberRef}
              style={styles.input}
              placeholder="Phone Number (e.g. 0412 345 678)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={12}
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.form}>
            <TextInput
              ref={streetRef}
              style={styles.input}
              placeholder="Street Address"
              value={address.street}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, street: text }))
              }
              autoComplete="street-address"
              returnKeyType="next"
              onSubmitEditing={() => street2Ref.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput
              ref={street2Ref}
              style={styles.input}
              placeholder="Street Address 2 (optional)"
              value={address.street2}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, street2: text }))
              }
              autoComplete="street-address"
              returnKeyType="next"
              onSubmitEditing={() => cityRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput
              ref={cityRef}
              style={styles.input}
              placeholder="Suburb / City"
              value={address.city}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, city: text }))
              }
              autoComplete="address-level2"
              returnKeyType="next"
              onSubmitEditing={() => postalCodeRef.current?.focus()}
              blurOnSubmit={false}
            />
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownLabel}>State</Text>
              <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                  style={styles.dropdownTouchable}
                  onPress={() => setShowStateDropdown((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownValue}>
                    {address.state
                      ? AU_STATES.find((s) => s.value === address.state)?.label
                      : "Select State"}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
                {showStateDropdown && (
                  <ScrollView
                    style={styles.dropdownList}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {AU_STATES.map((state) => (
                      <TouchableOpacity
                        key={state.value}
                        style={styles.dropdownListItem}
                        onPress={() => {
                          setAddress((prev) => ({
                            ...prev,
                            state: state.value,
                          }));
                          setShowStateDropdown(false);
                          postalCodeRef.current?.focus();
                        }}
                      >
                        <Text style={styles.dropdownListItemText}>
                          {state.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
            <TextInput
              ref={postalCodeRef}
              style={styles.input}
              placeholder="Postal Code (e.g. 2000)"
              value={address.postalCode}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, postalCode: text }))
              }
              keyboardType="numeric"
              maxLength={4}
              autoComplete="postal-code"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
            <TextInput
              style={[styles.input, { color: COLORS.gray }]}
              value="Australia"
              editable={false}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.form}>
            {/* Now tanks.map will work properly because tanks is an array */}
            {tanks.map((tank, idx) => (
              <View key={idx} style={styles.tankCard}>
                <Text style={styles.tankCardTitle}>Tank {idx + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tank Name"
                  value={tank.deviceId}
                  onChangeText={(text) =>
                    handleTankChange(idx, "deviceId", text)
                  }
                  autoCapitalize="characters"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Capacity (L, e.g. 3000)"
                  value={tank.capacity}
                  onChangeText={(text) =>
                    handleTankChange(idx, "capacity", text)
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Avg Daily Usage (L, e.g. 300)"
                  value={tank.avgDailyUsage}
                  onChangeText={(text) =>
                    handleTankChange(idx, "avgDailyUsage", text)
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Low Water Threshold (%)"
                  value={tank.lowWaterThreshold}
                  onChangeText={(text) =>
                    handleTankChange(idx, "lowWaterThreshold", text)
                  }
                  keyboardType="numeric"
                  maxLength={3}
                />
                <View style={styles.tankCardActions}>
                  {tanks.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTankBtn}
                      onPress={() => handleRemoveTank(idx)}
                    >
                      <Text style={styles.removeTankBtnText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  {idx === tanks.length - 1 && (
                    <TouchableOpacity
                      style={styles.addTankBtn}
                      onPress={handleAddTank}
                    >
                      <Text style={styles.addTankBtnText}>
                        + Add Another Tank
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        );
      case 3:
        return (
          <View style={styles.form}>
            <Text style={styles.reviewTitle}>Review & Confirm</Text>
            <Text style={styles.reviewSectionTitle}>Account</Text>
            <Text>
              Name: {firstName} {lastName}
            </Text>
            <Text>Email: {email}</Text>
            <Text>Phone: {phoneNumber}</Text>
            <Text style={styles.reviewSectionTitle}>Address</Text>
            <Text>
              {address.street}
              {address.street2 ? `, ${address.street2}` : ""}, {address.city},{" "}
              {address.state} {address.postalCode}, Australia
            </Text>
            <Text style={styles.reviewSectionTitle}>Tanks</Text>
            {tanks.map((tank, idx) => (
              <View key={idx} style={styles.reviewTankRow}>
                <Text style={styles.reviewTankTitle}>
                  Tank {idx + 1}: {tank.deviceId}
                </Text>
                <Text>Capacity: {tank.capacity} L</Text>
                <Text>Avg Usage: {tank.avgDailyUsage} L</Text>
                <Text>Low Water Threshold: {tank.lowWaterThreshold}%</Text>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  // State dropdown
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Enhanced water-themed gradient background */}
      <LinearGradient
        colors={AQUA_COLORS.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/login")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={AQUA_COLORS.primary}
            />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Let's set up your AquaPulse account
              </Text>
              <View style={styles.waterIconContainer}>
                <MaterialCommunityIcons
                  name="water-pump"
                  size={28}
                  color={AQUA_COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.formCard}>
              {renderStepper()}
              {renderStep()}

              <View style={styles.buttonRow}>
                {step > 0 && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                  >
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={20}
                      color={COLORS.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
                {step < steps.length - 1 ? (
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={COLORS.white}
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons
                      name="account-check"
                      size={20}
                      color={COLORS.white}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.registerButtonText}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.appInfoContainer}>
              <Text style={styles.appInfoText}>AquaPulse v1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 50,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  headerContainer: {
    marginBottom: 24,
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: AQUA_COLORS.dark,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
  },
  waterIconContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 3,
    borderColor: AQUA_COLORS.light,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "center",
    backgroundColor: "rgba(245, 247, 250, 0.8)",
    borderRadius: 16,
    padding: 12,
    maxWidth: 600,
  },
  stepperItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: AQUA_COLORS.primary,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.success,
  },
  stepNumber: {
    color: COLORS.gray,
    fontWeight: "700",
    fontSize: 16,
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepNumberCompleted: {
    color: "#fff",
  },
  stepLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 6,
    marginRight: 12,
    fontWeight: "500",
  },
  stepLabelActive: {
    color: AQUA_COLORS.primary,
    fontWeight: "700",
  },
  stepLine: {
    width: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 2,
  },
  form: {
    width: "100%",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E9ECF2",
    fontSize: 16,
  },
  passwordInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E9ECF2",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dropdownLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 12,
    width: 60,
  },
  dropdownWrapper: {
    flex: 1,
    position: "relative",
  },
  dropdownTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  dropdownValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  dropdownList: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 10,
    elevation: 10,
    maxHeight: 200, // Limit height to make scrolling necessary
  },
  dropdownListItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownListItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  tankCard: {
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECF2",
  },
  tankCardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 8,
  },
  tankCardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  addTankBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addTankBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  removeTankBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  removeTankBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  reviewTankRow: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  reviewTankTitle: {
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E9ECF2",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AQUA_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginLeft: 8,
    shadowColor: AQUA_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  registerButton: {
    backgroundColor: AQUA_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: AQUA_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 18,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  loginText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  loginLink: {
    color: AQUA_COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  appInfoContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  appInfoText: {
    color: COLORS.gray,
    fontSize: 12,
  },

  // ...rest of existing styles...
});
