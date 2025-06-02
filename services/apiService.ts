import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

const API_URL = 'http://192.168.76.68:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 5000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('userToken');
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
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
        }
        return Promise.reject(error);
      }
    );
  }

  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export default new ApiService();
