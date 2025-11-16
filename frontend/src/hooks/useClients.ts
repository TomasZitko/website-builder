/**
 * React Hooks for Client Management
 */

import { useState, useEffect } from 'react';
import { clientApi, CreateClientRequest } from '../api/b2b2c';

interface Client {
  id: string;
  developer_id: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  status: 'active' | 'inactive' | 'pending';
  monthly_fee?: number;
  billing_cycle: 'monthly' | 'yearly' | 'one-time';
  total_revenue: number;
  invitation_token?: string;
  invitation_sent_at?: Date;
  invitation_accepted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export function useClients(status?: 'active' | 'inactive' | 'pending') {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await clientApi.getAll(status);
      setClients(response.data.clients || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [status]);

  const createClient = async (clientData: CreateClientRequest) => {
    try {
      const response = await clientApi.create(clientData);
      await fetchClients(); // Refresh list
      return response.data.client;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create client');
    }
  };

  const updateClient = async (id: string, updates: Partial<CreateClientRequest>) => {
    try {
      const response = await clientApi.update(id, updates);
      await fetchClients(); // Refresh list
      return response.data.client;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update client');
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientApi.delete(id);
      await fetchClients(); // Refresh list
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete client');
    }
  };

  const inviteClient = async (clientId: string, accessLevel?: 'view' | 'edit' | 'admin') => {
    try {
      await clientApi.invite(clientId, accessLevel);
      await fetchClients(); // Refresh to show invitation sent
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to send invitation');
    }
  };

  return {
    clients,
    isLoading,
    error,
    refresh: fetchClients,
    createClient,
    updateClient,
    deleteClient,
    inviteClient,
  };
}

export function useClient(id: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await clientApi.getById(id);
        setClient(response.data.client);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch client');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id]);

  return { client, isLoading, error };
}
