import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";

const API_URL = "http://192.168.101.94:3000/api"; // Replace with your actual API URL

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    // Initialize axios instance without token first
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
    this.initializeToken(); // Don't await here, let it run in background
  }

  private async initializeToken() {
    try {
      this.token = await AsyncStorage.getItem("userToken");
      if (this.token) {
        this.api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      }
    } catch (error) {
      console.error("Error loading token:", error);
    }
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userData");
        }
        return Promise.reject(error);
      }
    );
  }

  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

// Create a singleton instance
const apiService = new ApiService();
export default apiService;
