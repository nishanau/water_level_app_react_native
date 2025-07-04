import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class NotificationService {
  async getNotifications() {
    try {
      const response = await api.get("/notifications");

      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async createNotification(notificationData) {
    try {
      const response = await api.post("/notifications", notificationData);
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }
}

export default new NotificationService();
