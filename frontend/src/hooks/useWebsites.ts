import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { useToast } from '../contexts/ToastContext';

export interface Website {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  custom_domain?: string;
  deployment_status: 'draft' | 'deploying' | 'live' | 'failed' | 'archived';
  deployment_url: string;
  total_views: number;
  unique_visitors: number;
  preview_image_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deployed_at?: string;
}

export interface DeploymentResult {
  success: boolean;
  deploymentUrl?: string;
  error?: string;
  deploymentTimeMs?: number;
}

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const fetchWebsites = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/v1/websites');
      setWebsites(response.data.websites || []);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to fetch websites';
      showError(errorMessage);
      setWebsites([]);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const createWebsite = async (data: {
    name: string;
    description?: string;
    html_code: string;
    css_code?: string;
    js_code?: string;
    theme?: string;
    subdomain?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/v1/websites', data);
      await fetchWebsites();
      showSuccess('Website created successfully!');
      return response.data.website;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create website';
      showError(errorMessage);
      throw err;
    }
  };

  const updateWebsite = async (id: string, data: Partial<Website>) => {
    try {
      const response = await apiClient.put(`/api/v1/websites/${id}`, data);
      await fetchWebsites();
      showSuccess('Website updated successfully!');
      return response.data.website;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update website';
      showError(errorMessage);
      throw err;
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      await apiClient.delete(`/api/v1/websites/${id}`);
      await fetchWebsites();
      showSuccess('Website deleted successfully!');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete website';
      showError(errorMessage);
      throw err;
    }
  };

  const deployWebsite = async (id: string): Promise<DeploymentResult> => {
    try {
      const response = await apiClient.post(`/api/v1/websites/${id}/deploy`);
      await fetchWebsites();

      if (response.data.success) {
        showSuccess('Website deployed successfully!');
      } else {
        showError(response.data.error || 'Deployment failed');
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to deploy website';
      showError(errorMessage);
      throw err;
    }
  };

  const setupCustomDomain = async (id: string, domain: string) => {
    try {
      const response = await apiClient.post(`/api/v1/websites/${id}/domain`, {
        domain
      });
      showSuccess('Domain setup initiated. Please add DNS records.');
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to setup domain';
      showError(errorMessage);
      throw err;
    }
  };

  const verifyCustomDomain = async (id: string, domain: string) => {
    try {
      const response = await apiClient.post(`/api/v1/websites/${id}/verify-domain`, {
        domain
      });

      if (response.data.verified) {
        showSuccess('Domain verified successfully!');
        await fetchWebsites();
      } else {
        showError(response.data.error || 'Domain verification failed');
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to verify domain';
      showError(errorMessage);
      throw err;
    }
  };

  return {
    websites,
    isLoading,
    fetchWebsites,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    deployWebsite,
    setupCustomDomain,
    verifyCustomDomain
  };
}
