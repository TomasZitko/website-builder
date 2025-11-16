/**
 * AGENCY DASHBOARD
 * Main command center for agency users
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgencyStore } from '@/store/agencyStore';
import {
  Users, FolderKanban, DollarSign, TrendingUp, Plus, ArrowRight,
  Building2, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AgencyDashboard() {
  const navigate = useNavigate();
  const { dashboardData, loading, fetchDashboard } = useAgencyStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const agency = dashboardData?.agency;
  const recentClients = dashboardData?.recent_clients || [];
  const recentProjects = dashboardData?.recent_projects || [];

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.total_clients || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Active Projects',
      value: stats?.active_projects || 0,
      icon: FolderKanban,
      gradient: 'from-purple-500 to-pink-500',
      change: '+8%'
    },
    {
      title: 'This Month',
      value: stats?.projects_this_month || 0,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      change: '+24%'
    },
    {
      title: 'Total Websites',
      value: stats?.total_websites || 0,
      icon: Sparkles,
      gradient: 'from-orange-500 to-red-500',
      change: '+16%'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                👋 Welcome back, {agency?.name}
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your agency today
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/agency/clients?action=new')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/agency/projects?action=new')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                New Project
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                />
                <div className="relative bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      'bg-gradient-to-br text-white shadow-lg',
                      stat.gradient
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Clients & Projects */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Clients</h2>
              <button
                onClick={() => navigate('/agency/clients')}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {recentClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No clients yet</p>
                <button
                  onClick={() => navigate('/agency/clients?action=new')}
                  className="mt-3 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Add your first client
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/agency/clients/${client.id}`)}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.total_projects} {client.total_projects === 1 ? 'project' : 'projects'}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      client.status === 'active' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                      client.status === 'inactive' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                    )}>
                      {client.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <button
                onClick={() => navigate('/agency/projects')}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No projects yet</p>
                <button
                  onClick={() => navigate('/agency/projects?action=new')}
                  className="mt-3 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Create your first project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/agency/projects/${project.id}`)}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-medium">{project.project_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.client?.name || 'Unknown client'}
                      </p>
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
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
