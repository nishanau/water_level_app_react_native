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
import { COLORS } from "../constants";
import authService from "../services/authService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email.trim());
      setResetSent(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
      Alert.alert(
        "Error",
        "Failed to send password reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Beautiful gradient background */}
      <LinearGradient
        colors={["#4f78ff", "#2d5bff", "#1a4be4"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/name.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formCard}>
              {!resetSent ? (
                <>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    Enter your email address and we`ll send you instructions to reset your password.
                  </Text>

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
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor="#9DA3B4"
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                      onPress={handleResetPassword}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={COLORS.white} />
                      ) : (
                        <Text style={styles.resetButtonText}>Send Reset Link</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <MaterialCommunityIcons 
                    name="email-check" 
                    size={70} 
                    color={COLORS.primary} 
                    style={styles.successIcon}
                  />
                  <Text style={styles.successTitle}>Check Your Email</Text>
                  <Text style={styles.successText}>
                    We`ve sent password reset instructions to {email}
                  </Text>
                  <TouchableOpacity
                    style={styles.backToLoginButton}
                    onPress={() => router.replace("/login")}
                  >
                    <Text style={styles.backToLoginText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.bottomLinks}>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.link}>Back to Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace("/register")}>
                  <Text style={styles.link}>Create Account</Text>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    paddingTop: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    height: 100,
    width: 180,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECF2',
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
  resetButton: {
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
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  backToLoginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    marginTop: 8,
  },
  backToLoginText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  link: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
