import { apiClient } from './client';

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    accountType?: 'personal' | 'agency';
    agencyName?: string;
  }) => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/v1/auth/login', {
      email,
      password
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/api/v1/auth/verify-email', {
      token
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/api/v1/auth/refresh', {
      refreshToken
    });
    return response.data;
  }
};
