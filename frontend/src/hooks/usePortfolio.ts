/**
 * React Hooks for Portfolio Management
 */

import { useState, useEffect } from 'react';
import { portfolioApi } from '../api/b2b2c';

interface PortfolioWebsite {
  id: string;
  developer_id: string;
  name: string;
  description?: string;
  category?: string;
  html_code: string;
  css_code?: string;
  js_code?: string;
  thumbnail_url?: string;
  preview_url?: string;
  is_featured: boolean;
  display_order: number;
  is_visible: boolean;
  fake_client_name?: string;
  fake_completion_date?: Date;
  fake_technologies: string[];
  fake_testimonial?: string;
  created_at: Date;
  updated_at: Date;
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await portfolioApi.getAll();
      setPortfolio(response.data.portfolio || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch portfolio');
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const generatePortfolio = async (count: number = 10) => {
    try {
      setIsGenerating(true);
      setError(null);
      const response = await portfolioApi.generate(count);
      setPortfolio(response.data.portfolio || []);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to generate portfolio';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const regeneratePortfolio = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const response = await portfolioApi.regenerate();
      setPortfolio(response.data.portfolio || []);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to regenerate portfolio';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateVisibility = async (id: string, isVisible: boolean) => {
    try {
      await portfolioApi.updateVisibility(id, isVisible);
      await fetchPortfolio(); // Refresh
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update visibility');
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      await portfolioApi.delete(id);
      await fetchPortfolio(); // Refresh
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete website');
    }
  };

  return {
    portfolio,
    isLoading,
    isGenerating,
    error,
    refresh: fetchPortfolio,
    generatePortfolio,
    regeneratePortfolio,
    updateVisibility,
    deleteWebsite,
  };
}

export function useFeaturedPortfolio() {
  const [featured, setFeatured] = useState<PortfolioWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const response = await portfolioApi.getFeatured();
        setFeatured(response.data.portfolio || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch featured portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { featured, isLoading, error };
}
