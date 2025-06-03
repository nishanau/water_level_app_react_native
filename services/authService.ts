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
      const { access_token, user } = response.data;

      await AsyncStorage.setItem("userToken", access_token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));

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
    }
  }

  async checkAuth(): Promise<{ token: string | null; user: any | null }> {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("userData");
      return {
        token,
        user: userData ? JSON.parse(userData) : null,
      };
    } catch (error) {
      return { token: null, user: null };
    }
  }

  async register(userData: RegisterData): Promise<void> {
    try {
      await this.api.post("/auth/register", userData);
    } catch (error: any) {
      console.error(
        "Registration error:",
        error.toJSON ? error.toJSON() : error
      );
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  }
}

export default new AuthService();
