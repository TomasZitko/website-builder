/**
 * B2B2C API Client
 * Handles all B2B2C API calls (portfolio, clients, subscriptions)
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const b2b2cApi = axios.create({
  baseURL: `${API_URL}/api/v1/b2b2c`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
b2b2cApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// PORTFOLIO APIs
// ============================================

export const portfolioApi = {
  generate: async (count: number = 10) => {
    const { data } = await b2b2cApi.post('/portfolio/generate', { count });
    return data;
  },

  regenerate: async () => {
    const { data } = await b2b2cApi.post('/portfolio/regenerate');
    return data;
  },

  getAll: async () => {
    const { data } = await b2b2cApi.get('/portfolio');
    return data;
  },

  getFeatured: async () => {
    const { data } = await b2b2cApi.get('/portfolio/featured');
    return data;
  },

  updateVisibility: async (id: string, isVisible: boolean) => {
    const { data } = await b2b2cApi.patch(`/portfolio/${id}/visibility`, {
      is_visible: isVisible,
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await b2b2cApi.delete(`/portfolio/${id}`);
    return data;
  },
};

// ============================================
// CLIENT APIs
// ============================================

export interface CreateClientRequest {
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  monthly_fee?: number;
  billing_cycle?: 'monthly' | 'yearly' | 'one-time';
  notes?: string;
}

export const clientApi = {
  create: async (clientData: CreateClientRequest) => {
    const { data } = await b2b2cApi.post('/clients', clientData);
    return data;
  },

  getAll: async (status?: 'active' | 'inactive' | 'pending') => {
    const { data } = await b2b2cApi.get('/clients', {
      params: status ? { status } : {},
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await b2b2cApi.get(`/clients/${id}`);
    return data;
  },

  update: async (id: string, updates: Partial<CreateClientRequest>) => {
    const { data } = await b2b2cApi.patch(`/clients/${id}`, updates);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await b2b2cApi.delete(`/clients/${id}`);
    return data;
  },

  invite: async (clientId: string, accessLevel?: 'view' | 'edit' | 'admin') => {
    const { data } = await b2b2cApi.post(`/clients/${clientId}/invite`, {
      access_level: accessLevel,
    });
    return data;
  },

  acceptInvitation: async (token: string) => {
    const { data } = await b2b2cApi.post('/clients/accept-invitation', { token });
    return data;
  },

  getWebsites: async (clientId: string) => {
    const { data } = await b2b2cApi.get(`/clients/${clientId}/websites`);
    return data;
  },

  linkWebsite: async (
    clientId: string,
    websiteId: string,
    projectDetails?: {
      project_name?: string;
      quoted_price?: number;
      estimated_completion?: string;
    }
  ) => {
    const { data } = await b2b2cApi.post(
      `/clients/${clientId}/websites/${websiteId}/link`,
      projectDetails
    );
    return data;
  },

  updateWebsiteStatus: async (
    clientWebsiteId: string,
    projectStatus: 'in_progress' | 'review' | 'completed' | 'maintenance',
    paymentStatus?: 'unpaid' | 'partial' | 'paid'
  ) => {
    const { data } = await b2b2cApi.patch(`/client-websites/${clientWebsiteId}/status`, {
      project_status: projectStatus,
      payment_status: paymentStatus,
    });
    return data;
  },

  recordRevenue: async (clientId: string, amount: number, description: string) => {
    const { data } = await b2b2cApi.post(`/clients/${clientId}/revenue`, {
      amount,
      description,
    });
    return data;
  },
};

// ============================================
// STATS APIs
// ============================================

export const statsApi = {
  getDeveloperStats: async () => {
    const { data } = await b2b2cApi.get('/stats');
    return data;
  },
};

// ============================================
// ACCOUNT APIs
// ============================================

export const accountApi = {
  upgrade: async (
    accountType: 'personal' | 'freelancer' | 'agency',
    agencyName?: string,
    agencyLogoUrl?: string
  ) => {
    const { data } = await b2b2cApi.post('/account/upgrade', {
      account_type: accountType,
      agency_name: agencyName,
      agency_logo_url: agencyLogoUrl,
    });
    return data;
  },
};

// ============================================
// SUBSCRIPTION PLANS APIs
// ============================================

export const plansApi = {
  getAll: async () => {
    const { data } = await b2b2cApi.get('/plans');
    return data;
  },
};

export default {
  portfolio: portfolioApi,
  client: clientApi,
  stats: statsApi,
  account: accountApi,
  plans: plansApi,
};
