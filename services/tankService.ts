import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class TankService {
  async getTankData(tankId: string) {
    const response = await api.get(`/tanks/${tankId}`);

    return response.data;
  }

  async getAllTanks() {
    const response = await api.get(`/tanks`);

    return response.data;
  }
}

export default new TankService();
