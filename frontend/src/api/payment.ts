import { apiClient } from './client';

export const paymentApi = {
  createCheckout: async (
    websiteId: string,
    successUrl: string,
    cancelUrl: string
  ) => {
    const response = await apiClient.post('/api/v1/payment/create-checkout', {
      websiteId,
      successUrl,
      cancelUrl
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/api/v1/payment/history');
    return response.data;
  }
};
