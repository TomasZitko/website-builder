/**
 * CLIENTS PAGE
 * Manage agency clients with full CRUD operations
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useClientsStore } from '@/store/clientsStore';
import { Plus, Search, Filter, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/agency';

export function Clients() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clients, loading, fetchClients, deleteClient } = useClientsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    // Check if we should show the "new client" modal
    if (searchParams.get('action') === 'new') {
      // TODO: Open add client modal
      setSearchParams({});
    }
  }, [searchParams]);

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? All their projects will also be deleted.')) {
      try {
        await deleteClient(clientId);
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Clients</h1>
              <p className="text-muted-foreground">
                Manage your agency clients and their projects
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Clients Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-2xl">
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'No clients match your filters'
                : 'No clients yet. Add your first client to get started!'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Your First Client
              </motion.button>
            )}
          </div>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Client</th>
                  <th className="text-left px-6 py-4 font-semibold">Contact</th>
                  <th className="text-left px-6 py-4 font-semibold">Company</th>
                  <th className="text-left px-6 py-4 font-semibold">Projects</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredClients.map((client, index) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/agency/clients/${client.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {client.contact_email || 'No email'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {client.company_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium">
                          {client.total_projects}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          client.status === 'active' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                          client.status === 'inactive' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
                          client.status === 'archived' && 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        )}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agency/clients/${client.id}`);
                            }}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            title="View Client"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Open edit modal
                            }}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            title="Edit Client"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client.id);
                            }}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
