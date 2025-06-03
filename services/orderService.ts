import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class OrderService {
  async getOrders() {
    const response = await api.get("/orders");

    return response.data;
  }

  async placeOrder() {
    const response = await api.post("/orders");
    return response.data;
  }

  async cancelOrder(orderId) {
    await api.patch(`/orders/${orderId}/cancel`);
  }
}

export default new OrderService();
