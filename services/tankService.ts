import apiService from "./apiService";

const api = apiService.getAxiosInstance();

class TankService {
  async getTankData(tankId : string) {
   
    const response = await api.get(`/tanks/${tankId}`);
    console.log("Tank data response:", response.data);
    return response.data;
  }

  async saveTankSettings(settings) {
    await api.patch("/tanks/settings", settings);
  }
}

export default new TankService();
