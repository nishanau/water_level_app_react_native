import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class NotificationService {
  async getNotifications() {
    const response = await api.get("/notifications");
    console.log("Notifications response:", response.data);
    return response.data;
  }
}

export default new NotificationService();
