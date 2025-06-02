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
import { useAppContext } from "../AppContext";
import { COLORS } from "../constants";
import authService from "../services/authService";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("customer");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const validateForm = () => {
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
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        role,
        address,
        notificationPreferences: {
          push: true,
          email: true,
          sms: false,
        },
      };

      await authService.register(userData);
      // Login after successful registration
      await login({ email, password });
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.form}>
              <View style={styles.roleToggle}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "customer" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("customer")}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === "customer" && styles.roleButtonTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "supplier" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("supplier")}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === "supplier" && styles.roleButtonTextActive,
                    ]}
                  >
                    Supplier
                  </Text>
                </TouchableOpacity>
              </View>

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

              <Text style={styles.sectionTitle}>Address</Text>

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

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  roleToggle: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButtonText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  roleButtonTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
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
