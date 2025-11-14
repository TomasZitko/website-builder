import { apiClient } from './client';

export const websitesApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/v1/websites');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/websites/${id}`);
    return response.data;
  },

  update: async (id: string, data: {
    htmlCode?: string;
    cssCode?: string;
    jsCode?: string;
  }) => {
    const response = await apiClient.put(`/api/v1/websites/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/websites/${id}`);
    return response.data;
  }
};
