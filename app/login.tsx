import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setIsAuthenticated, setNewNotification } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    const credentials = {
      email: email.trim(),
      password,
    };
    setLoginLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);

      const newNoti = {
        userId: response.user.id,
        type: "system",
        message: `Welcome back, ${response.user.firstName}!`,
        relatedTo: "users",
        read: false,
        sentVia: ["push"],
      };
      setNewNotification(newNoti);

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      Alert.alert("Login Error", errorMessage);
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Beautiful gradient background */}
      <LinearGradient
        colors={["#e3f0ff", "#f8fbff", "#fff"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/name.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={22}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#9DA3B4"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={22}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9DA3B4"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color={COLORS.gray}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push("/forgot-password")}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loginLoading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/register")}>
                    <Text style={styles.registerLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    height: 100,
    width: 180,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECF2",
    height: 56,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: 56,
  },
  eyeIcon: {
    padding: 12,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  registerText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
