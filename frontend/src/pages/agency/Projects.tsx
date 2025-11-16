/**
 * PROJECTS PAGE
 * Manage all agency projects
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '@/store/projectsStore';
import { FolderKanban, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Projects() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects } = useProjectsStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Projects</h1>
              <p className="text-muted-foreground">
                All projects across your agency
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-2xl">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No projects yet. Create your first project to get started!
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create First Project
            </motion.button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/agency/projects/${project.id}`)}
                className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg">{project.project_name}</h3>
                  <div className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    project.status === 'live' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                    project.status === 'generating' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                    project.status === 'draft' && 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                  )}>
                    {project.status}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Client: {project.client?.name || 'Unknown'}
                </p>

                {project.project_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.project_description}
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
