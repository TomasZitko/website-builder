/**
 * Version History Panel
 * Shows all saved versions of the website and allows restoration
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, RotateCcw, Clock, X, Check, AlertCircle } from 'lucide-react';
import { apiClient } from '@/api/client';

interface Version {
  id: string;
  website_id: string;
  version_number: number;
  html_code: string;
  css_code: string;
  js_code: string;
  change_description: string;
  created_at: string;
}

interface VersionHistoryProps {
  websiteId: string;
  onVersionRestored?: () => void;
}

export function VersionHistory({ websiteId, onVersionRestored }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (isOpen && websiteId) {
      loadVersions();
    }
  }, [isOpen, websiteId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/v1/websites/${websiteId}/versions`);
      setVersions(response.data.versions || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load versions');
      console.error('Error loading versions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (version: Version) => {
    if (!confirm(`Are you sure you want to restore to Version ${version.version_number}?`)) {
      return;
    }

    try {
      setIsRestoring(true);
      setError(null);
      setSuccess(null);

      await apiClient.post(`/api/v1/websites/${websiteId}/versions/${version.id}/restore`);

      setSuccess(`Successfully restored to Version ${version.version_number}`);
      setPreviewVersion(null);

      // Reload versions after restore
      await loadVersions();

      // Notify parent component
      if (onVersionRestored) {
        onVersionRestored();
      }

      // Close panel after a brief delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to restore version');
      console.error('Error restoring version:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

      // Format as date if older than a week
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isOpen
            ? 'bg-foreground/10 text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
        }`}
        title="Version History"
      >
        <History className="w-4 h-4" />
        <span className="hidden md:inline">History</span>
      </button>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-background border-l border-border z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-foreground/10">
                    <History className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Version History</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {versions.length} version{versions.length !== 1 ? 's' : ''} saved
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-6 mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3"
                >
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700">{success}</p>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No version history yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Versions are created automatically when you make changes
                    </p>
                  </div>
                ) : (
                  versions.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        previewVersion?.id === version.id
                          ? 'border-foreground/30 bg-foreground/5'
                          : 'border-border hover:border-foreground/20 hover:bg-foreground/5'
                      }`}
                      onClick={() => setPreviewVersion(version)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-foreground">
                              Version {version.version_number}
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 rounded">
                                Current
                              </span>
                            )}
                          </div>

                          {version.change_description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {version.change_description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTime(version.created_at)}
                          </div>
                        </div>

                        {index !== 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(version);
                            }}
                            disabled={isRestoring}
                            className="ml-3 p-2 rounded-lg hover:bg-foreground/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Restore this version"
                          >
                            <RotateCcw className="w-4 h-4 text-foreground" />
                          </button>
                        )}
                      </div>

                      {/* Preview on selection */}
                      {previewVersion?.id === version.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 rounded bg-foreground/5">
                              <span className="font-medium text-muted-foreground">HTML</span>
                              <p className="text-foreground mt-1 font-mono">
                                {version.html_code.length} chars
                              </p>
                            </div>
                            <div className="p-2 rounded bg-foreground/5">
                              <span className="font-medium text-muted-foreground">CSS</span>
                              <p className="text-foreground mt-1 font-mono">
                                {version.css_code?.length || 0} chars
                              </p>
                            </div>
                            <div className="p-2 rounded bg-foreground/5">
                              <span className="font-medium text-muted-foreground">JS</span>
                              <p className="text-foreground mt-1 font-mono">
                                {version.js_code?.length || 0} chars
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Click on a version to preview details. Restoring creates a new version.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
