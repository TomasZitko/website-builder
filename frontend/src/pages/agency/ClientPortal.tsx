/**
 * CLIENT PORTAL
 * White-labeled portal for specific client with their projects
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agencyApi } from '@/api/agency';
import { FolderKanban, Globe, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ClientPortalData } from '@/types/agency';

export function ClientPortal() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const loadPortalData = async () => {
      try {
        setLoading(true);
        const data = await agencyApi.getClientPortal(clientId);
        setPortalData(data);

        // Apply white-label branding
        if (data.branding.primary_color) {
          document.documentElement.style.setProperty('--primary', data.branding.primary_color);
        }
      } catch (error) {
        console.error('Failed to load client portal:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();

    // Cleanup: Reset branding on unmount
    return () => {
      document.documentElement.style.removeProperty('--primary');
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading client portal...</p>
        </div>
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Client not found</p>
          <button
            onClick={() => navigate('/agency/clients')}
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const { client, agency, projects, branding } = portalData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
      {/* Header with White-Label Branding */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/agency/clients')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </button>

          <div className="flex items-center gap-4">
            {/* Logo or Icon */}
            {branding.logo_url ? (
              <img
                src={branding.logo_url}
                alt={branding.company_name || agency.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Client Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{client.name}</h1>
              <p className="text-muted-foreground">
                {branding.company_name || agency.name} • {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </p>
            </div>

            {/* Status Badge */}
            <div className={cn(
              'px-4 py-2 rounded-lg font-medium',
              client.status === 'active' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
              client.status === 'inactive' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
            )}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Contact Email</p>
            <p className="font-medium">{client.contact_email || 'Not provided'}</p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Company</p>
            <p className="font-medium">{client.company_name || 'Not provided'}</p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-1">Industry</p>
            <p className="font-medium">{client.industry || 'Not specified'}</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Projects</h2>

          {projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No projects yet for this client</p>
              <button
                onClick={() => navigate('/agency/projects?action=new&client=' + clientId)}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Create a project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (project.website_id) {
                      navigate(`/builder/${project.website_id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      project.status === 'live' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                      project.status === 'generating' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                      project.status === 'draft' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                    )}>
                      {project.status}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">{project.project_name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.project_description || 'No description'}
                  </p>

                  {project.website?.subdomain && (
                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                      <Globe className="w-4 h-4" />
                      <span>{project.website.subdomain}.webchat.cz</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        {client.notes && (
          <div className="mt-6 bg-card border rounded-2xl p-6">
            <h3 className="font-bold mb-3">Notes</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
