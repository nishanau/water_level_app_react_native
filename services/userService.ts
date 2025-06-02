import apiService from './apiService';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  private api = apiService.getAxiosInstance();

  async updateProfile(profile: UserProfile) {
    const response = await this.api.patch('/users/profile', profile);
    return response.data;
  }

  async changePassword(passwordData: PasswordChange) {
    const response = await this.api.post('/users/change-password', passwordData);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/users/profile');
    return response.data;
  }
}

export default new UserService();
