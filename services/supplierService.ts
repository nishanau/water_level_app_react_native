import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class SupplierService {
  async getSuppliers() {
    const response = await api.get(`/suppliers`);

    return response.data;
  }
}

export default new SupplierService();

