import { STORAGE_KEYS } from "@/types/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  USER_DATA: "userData",
  USER_ORDERS: "userOrders",
  PAYMENT_METHODS: "paymentMethods",
  TANK_SETTINGS: "tankSettings",
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

export interface LocalStorage {
  [STORAGE_KEYS.USER_DATA]: UserData;
  [STORAGE_KEYS.USER_ORDERS]: Order[];
  [STORAGE_KEYS.PAYMENT_METHODS]: PaymentMethod[];
  [STORAGE_KEYS.TANK_SETTINGS]: Tanks;
}

class StorageService {
  async getUserData(): Promise<UserData | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  async getOrders(): Promise<Order[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_ORDERS);
    return data ? JSON.parse(data) : [];
  }

  async getTankSettings(): Promise<Tanks | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TANK_SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return data ? JSON.parse(data) : [];
  }

  async updateUserData(userData: UserData): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(userData)
    );
  }

  async updateOrders(orders: Order[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_ORDERS,
      JSON.stringify(orders)
    );
  }

  async updateTankSettings(settings: TankSettings): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TANK_SETTINGS,
      JSON.stringify(settings)
    );
  }

  async updatePaymentMethods(methods: PaymentMethod[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PAYMENT_METHODS,
      JSON.stringify(methods)
    );
  }

  async clearAll(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }
}

export default new StorageService();
