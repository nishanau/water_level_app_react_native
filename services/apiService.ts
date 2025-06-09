import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";

const API_URL = "http://192.168.3.68:3000/api"; // Replace with your actual API URL
// const API_URL = "http://192.168.101.94:3000/api"

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
        this.api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.token}`;
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
  /**
   * Patch multiple fields in any table.
   * @param table The table/collection name (e.g., "users", "orders")
   * @param id The record's unique identifier
   * @param updates An object with fields and their new values
   * @returns The updated record (or server response)
   */
  async patchFields(
    table: string,
    id: string,
    updates: Record<string, any>
  ): Promise<any> {
    try {
      const response = await this.api.patch(`/${table}/${id}`, updates);
      console.log("Patch fields response:", response.data);

      // Update the token in case it was refreshed
      if (response.data.token) {
        this.token = response.data.token;
        this.api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.token}`;
      }

      return response.data;
    } catch (error: any) {
      console.error("Patch fields error:", error);
      throw new Error(error.response?.data?.message || "Update failed");
    }
  }

  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

// Create a singleton instance
const apiService = new ApiService();
export default apiService;
