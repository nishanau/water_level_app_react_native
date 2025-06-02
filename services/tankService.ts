import axios from 'axios';

const API_URL = 'http://your-api-url/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

class TankService {
  async getTankData() {
    const response = await api.get('/tanks/current');
    return response.data;
  }

  async saveTankSettings(settings) {
    await api.patch('/tanks/settings', settings);
  }
}

export default new TankService();
