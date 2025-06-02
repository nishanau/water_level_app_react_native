import axios from 'axios';

const API_URL = 'http://your-api-url/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

class NotificationService {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  }
}

export default new NotificationService();
