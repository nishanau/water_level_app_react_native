import apiService from './apiService';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  last4: string;
  isDefault: boolean;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  bankName?: string;
}

export interface NewCardData {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  cardholderName: string;
}

class PaymentService {
  private api = apiService.getAxiosInstance();

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.api.get('/payment-methods');
    return response.data;
  }

  async addPaymentMethod(cardData: NewCardData): Promise<PaymentMethod> {
    const response = await this.api.post('/payment-methods', cardData);
    return response.data;
  }

  async setDefaultPaymentMethod(id: string): Promise<void> {
    await this.api.post(`/payment-methods/${id}/default`);
  }

  async removePaymentMethod(id: string): Promise<void> {
    await this.api.delete(`/payment-methods/${id}`);
  }
}

export default new PaymentService();
