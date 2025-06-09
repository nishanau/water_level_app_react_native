import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class SupplierService {
  //  * Fetches all suppliers from the API..
  // * @returns {Promise<Array>}
  async getSuppliers() {
    try {
      const response = await api.get(`/suppliers`);
      // await AsyncStorage.setItem("suppliers", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  }
}

export default new SupplierService();
