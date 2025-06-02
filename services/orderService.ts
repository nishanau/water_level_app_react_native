import axios from 'axios';

const API_URL = 'http://your-api-url/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

class OrderService {
  async getOrders() {
    const response = await api.get('/orders');
    return response.data;
  }

  async placeOrder() {
    const response = await api.post('/orders');
    return response.data;
  }

  async cancelOrder(orderId) {
    await api.patch(`/orders/${orderId}/cancel`);
  }
}

export default new OrderService();
