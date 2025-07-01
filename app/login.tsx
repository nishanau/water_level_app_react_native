import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
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

      <View style={styles.content}>
        <Image
          source={require("../assets/images/name.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* <Text style={styles.title}>Sign In</Text> */}

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/forgot-password")}
          > */}
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          {/* </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {loginLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}> Login</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don`t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    height: 120,
    width: "100%",
    marginBottom: 32,
    opacity: 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    marginBottom: 15,
    color: COLORS.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
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
