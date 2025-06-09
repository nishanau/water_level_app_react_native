import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class OrderService {
  async getOrders() {
    try {
      const response = await api.get("/orders");

      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async placeOrder(orderData) {
    try {
      const response = await api.post("/orders", { ...orderData });
      console.log("Order placed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }

  async cancelOrder(orderId:string) {
    await api.patch(`/orders/${orderId}/cancel`);
  }
}

export default new OrderService();
