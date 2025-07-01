import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
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
  View,
} from "react-native";
import { COLORS } from "../constants";
import authService from "../services/authService";

type TankInput = {
  deviceId: string;
  capacity: string;
  avgDailyUsage: string;
  lowWaterThreshold: string;
};

const steps = ["Account", "Address", "Tanks", "Review"];

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

  // Step 2: Address
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  // Step 3: Tanks
  const [tanks, setTanks] = useState<TankInput[]>([
    { deviceId: "", capacity: "", avgDailyUsage: "", lowWaterThreshold: "" },
  ]);

  // Validation
  const validateStep = () => {
    if (step === 0) {
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !phoneNumber
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
      return true;
    }
    if (step === 1) {
      if (
        !address.street ||
        !address.city ||
        !address.state ||
        !address.postalCode ||
        !address.country
      ) {
        Alert.alert("Error", "Please fill in all address fields");
        return false;
      }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < tanks.length; i++) {
        const t = tanks[i];
        if (
          !t.deviceId ||
          !t.capacity ||
          !t.avgDailyUsage ||
          !t.lowWaterThreshold
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
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        role: "customer",
        address,
        tanks: tanks.map((t) => ({
          deviceId: t.deviceId,
          capacity: Number(t.capacity),
          avgDailyUsage: Number(t.avgDailyUsage),
          lowWaterThreshold: Number(t.lowWaterThreshold),
        })),
      };
      await authService.register(userData);

      Alert.alert("Success", "Account created! Please login.");
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
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Street"
              value={address.street}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, street: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={address.city}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, city: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={address.state}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, state: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              value={address.postalCode}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, postalCode: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Country"
              value={address.country}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, country: text }))
              }
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.form}>
            {tanks.map((tank, idx) => (
              <View key={idx} style={styles.tankCard}>
                <Text style={styles.tankCardTitle}>Tank {idx + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tank Name / Device ID"
                  value={tank.deviceId}
                  onChangeText={(text) =>
                    handleTankChange(idx, "deviceId", text)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Capacity (L)"
                  value={tank.capacity}
                  onChangeText={(text) =>
                    handleTankChange(idx, "capacity", text)
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Avg Daily Usage (L)"
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
              {address.street}, {address.city}, {address.state},{" "}
              {address.postalCode}, {address.country}
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            {renderStepper()}
            {renderStep()}
            <View style={styles.buttonRow}>
              {step > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              {step < steps.length - 1 ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={loading}
                >
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 40,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 18,
    textAlign: "center",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "center",
  },
  stepperItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.primary,
    fontWeight: "700",
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 2,
  },
  form: {
    width: "100%",
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  tankCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  backButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginLeft: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: "center",
    marginLeft: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  loginText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
