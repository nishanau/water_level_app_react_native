import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "./apiService";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
  success: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "customer" | "supplier" | "admin";
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  notificationPreferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

class AuthService {
  private api = apiService.getAxiosInstance();

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post("/auth/login", credentials);
      const { access_token, user, refresh_token } = response.data;
      console.log("Login response:", response.data);
      await AsyncStorage.setItem("userToken", access_token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      await AsyncStorage.setItem("refresh_token", refresh_token);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async logout(): Promise<void> {
    try {
      const res = await this.api.post("/auth/logout");
      console.log("Logout response:", res.data);
    } finally {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("refresh_token");
    }
  }

  async fetchUserData(): Promise<any> {
    try {
      const response = await this.api.get("/users/me");
      const userData = response.data;

      // Update AsyncStorage with fresh data
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      return userData;
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch user data"
      );
    }
  }

  async checkAuth(): Promise<{ token: string | null; user: any | null }> {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        return { token: null, user: null };
      }

      const userData = await AsyncStorage.getItem("userData");
      let user = null;
      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      // Fetch fresh user data instead of reading from storage
      //const user = await this.fetchUserData();

      return { token, user };
    } catch (error) {
      console.error("Auth check failed:", error);
      return { token: null, user: null };
    }
  }

  async checkPassword(userId: string, password: string): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return false;

      const response = await this.api.post("/auth/check-password", {
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error("Check password error:", error.message);
      return false;
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      return await this.api.post("/auth/register-user", userData);
    } catch (error: any) {
      console.error(
        "Registration error:",
        error.toJSON ? error.toJSON() : error
      );
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await this.api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      console.error("Password reset request error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to request password reset"
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await this.api.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
}

export default new AuthService();
