/**
 * AGENCY STORE
 * Zustand store for agency state management
 */

import { create } from 'zustand';
import { agencyApi } from '@/api/agency';
import type { Agency, AgencyDashboard, AgencyStats, Client, AgencyProjectWithRelations } from '@/types/agency';

interface AgencyState {
  // State
  agency: Agency | null;
  dashboardData: AgencyDashboard | null;
  stats: AgencyStats | null;
  recentClients: Client[];
  recentProjects: AgencyProjectWithRelations[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchAgency: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  updateAgency: (data: Partial<Agency>) => Promise<void>;
  clearAgency: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAgencyStore = create<AgencyState>((set, get) => ({
  // Initial state
  agency: null,
  dashboardData: null,
  stats: null,
  recentClients: [],
  recentProjects: [],
  loading: false,
  error: null,

  // Fetch agency info
  fetchAgency: async () => {
    try {
      set({ loading: true, error: null });
      const agency = await agencyApi.getMyAgency();
      set({ agency, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch agency:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch agency',
        loading: false
      });
    }
  },

  // Fetch dashboard data (includes agency, stats, recent clients/projects)
  fetchDashboard: async () => {
    try {
      set({ loading: true, error: null });
      const dashboardData = await agencyApi.getDashboard();

      set({
        dashboardData,
        agency: dashboardData.agency,
        stats: dashboardData.stats,
        recentClients: dashboardData.recent_clients,
        recentProjects: dashboardData.recent_projects,
        loading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch dashboard',
        loading: false
      });
    }
  },

  // Update agency
  updateAgency: async (data: Partial<Agency>) => {
    try {
      set({ loading: true, error: null });
      const updatedAgency = await agencyApi.updateAgency(data);
      set({ agency: updatedAgency, loading: false });
    } catch (error: any) {
      console.error('Failed to update agency:', error);
      set({
        error: error.response?.data?.error || 'Failed to update agency',
        loading: false
      });
      throw error;
    }
  },

  // Clear agency data (on logout)
  clearAgency: () => {
    set({
      agency: null,
      dashboardData: null,
      stats: null,
      recentClients: [],
      recentProjects: [],
      error: null
    });
  },

  // Set loading
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  }
}));
