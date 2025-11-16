/**
 * CLIENTS STORE
 * Zustand store for client management
 */

import { create } from 'zustand';
import { agencyApi } from '@/api/agency';
import type { Client, CreateClientFormData, UpdateClientFormData, ClientsFilterState } from '@/types/agency';

interface ClientsState {
  // State
  clients: Client[];
  selectedClient: Client | null;
  filters: ClientsFilterState;
  loading: boolean;
  error: string | null;

  // Actions
  fetchClients: () => Promise<void>;
  fetchClient: (clientId: string) => Promise<void>;
  createClient: (data: CreateClientFormData) => Promise<Client>;
  updateClient: (clientId: string, data: UpdateClientFormData) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
  setFilters: (filters: ClientsFilterState) => void;
  clearClients: () => void;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  // Initial state
  clients: [],
  selectedClient: null,
  filters: {},
  loading: false,
  error: null,

  // Fetch all clients
  fetchClients: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const clients = await agencyApi.getClients(filters);
      set({ clients, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch clients',
        loading: false
      });
    }
  },

  // Fetch single client
  fetchClient: async (clientId: string) => {
    try {
      set({ loading: true, error: null });
      const client = await agencyApi.getClient(clientId);
      set({ selectedClient: client, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch client:', error);
      set({
        error: error.response?.data?.error || 'Failed to fetch client',
        loading: false
      });
    }
  },

  // Create new client
  createClient: async (data: CreateClientFormData) => {
    try {
      set({ loading: true, error: null });
      const newClient = await agencyApi.createClient(data);

      // Add to clients list
      set((state) => ({
        clients: [newClient, ...state.clients],
        loading: false
      }));

      return newClient;
    } catch (error: any) {
      console.error('Failed to create client:', error);
      set({
        error: error.response?.data?.error || 'Failed to create client',
        loading: false
      });
      throw error;
    }
  },

  // Update client
  updateClient: async (clientId: string, data: UpdateClientFormData) => {
    try {
      set({ loading: true, error: null });
      const updatedClient = await agencyApi.updateClient(clientId, data);

      // Update in clients list
      set((state) => ({
        clients: state.clients.map((c) =>
          c.id === clientId ? updatedClient : c
        ),
        selectedClient:
          state.selectedClient?.id === clientId ? updatedClient : state.selectedClient,
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to update client:', error);
      set({
        error: error.response?.data?.error || 'Failed to update client',
        loading: false
      });
      throw error;
    }
  },

  // Delete client
  deleteClient: async (clientId: string) => {
    try {
      set({ loading: true, error: null });
      await agencyApi.deleteClient(clientId);

      // Remove from clients list
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== clientId),
        selectedClient:
          state.selectedClient?.id === clientId ? null : state.selectedClient,
        loading: false
      }));
    } catch (error: any) {
      console.error('Failed to delete client:', error);
      set({
        error: error.response?.data?.error || 'Failed to delete client',
        loading: false
      });
      throw error;
    }
  },

  // Set selected client
  setSelectedClient: (client: Client | null) => {
    set({ selectedClient: client });
  },

  // Set filters
  setFilters: (filters: ClientsFilterState) => {
    set({ filters });
    // Re-fetch clients with new filters
    get().fetchClients();
  },

  // Clear clients data (on logout)
  clearClients: () => {
    set({
      clients: [],
      selectedClient: null,
      filters: {},
      error: null
    });
  }
}));
