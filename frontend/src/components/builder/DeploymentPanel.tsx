/**
 * Deployment Panel
 * Shows deployment status and controls for publishing websites
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader
} from 'lucide-react';
import { apiClient } from '@/api/client';

interface DeploymentInfo {
  status: 'not_deployed' | 'deploying' | 'deployed' | 'failed';
  deployment_url?: string;
  custom_domain?: string;
  subdomain?: string;
  last_deployed_at?: string;
  error_message?: string;
}

interface DeploymentPanelProps {
  websiteId: string;
  websiteName: string;
}

export function DeploymentPanel({ websiteId, websiteName }: DeploymentPanelProps) {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (websiteId) {
      loadDeploymentInfo();
    }
  }, [websiteId]);

  const loadDeploymentInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/v1/websites/${websiteId}`);
      const website = response.data.website;

      setDeploymentInfo({
        status: website.deployment_status || 'not_deployed',
        deployment_url: website.deployment_url,
        custom_domain: website.custom_domain,
        subdomain: website.subdomain,
        last_deployed_at: website.last_deployed_at,
        error_message: website.deployment_error
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load deployment info');
      console.error('Error loading deployment info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      setError(null);

      await apiClient.post(`/api/v1/deployment/deploy/${websiteId}`);

      // Poll for deployment status
      const pollInterval = setInterval(async () => {
        const response = await apiClient.get(`/api/v1/websites/${websiteId}`);
        const website = response.data.website;

        setDeploymentInfo({
          status: website.deployment_status || 'not_deployed',
          deployment_url: website.deployment_url,
          custom_domain: website.custom_domain,
          subdomain: website.subdomain,
          last_deployed_at: website.last_deployed_at,
          error_message: website.deployment_error
        });

        if (website.deployment_status === 'deployed' || website.deployment_status === 'failed') {
          clearInterval(pollInterval);
          setIsDeploying(false);
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsDeploying(false);
      }, 300000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deploy website');
      console.error('Error deploying website:', err);
      setIsDeploying(false);
    }
  };

  const handleRedeploy = async () => {
    if (!confirm('Are you sure you want to redeploy? This will update the live website.')) {
      return;
    }
    await handleDeploy();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'deploying':
        return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'failed':
        return 'text-red-600 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-600 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'deploying':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'Live';
      case 'deploying':
        return 'Deploying...';
      case 'failed':
        return 'Failed';
      default:
        return 'Not Deployed';
    }
  };

  const liveUrl = deploymentInfo?.custom_domain
    ? `https://${deploymentInfo.custom_domain}`
    : deploymentInfo?.deployment_url || deploymentInfo?.subdomain
    ? `https://${deploymentInfo.subdomain}.webchat.cz`
    : null;

  if (isLoading) {
    return (
      <div className="p-6 bg-card rounded-lg border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-foreground/10 rounded w-1/3"></div>
          <div className="h-20 bg-foreground/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card rounded-lg border border-border"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Deployment Status</h3>
            <p className="text-sm text-muted-foreground">Manage your website's live deployment</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${getStatusColor(deploymentInfo?.status || 'not_deployed')}`}>
            {getStatusIcon(deploymentInfo?.status || 'not_deployed')}
            <span className="text-sm font-medium">{getStatusText(deploymentInfo?.status || 'not_deployed')}</span>
          </div>
        </div>

        {/* Live URL */}
        {liveUrl && deploymentInfo?.status === 'deployed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-foreground/5 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-green-600 hover:underline truncate"
                >
                  {liveUrl}
                </a>
                <ExternalLink className="w-3 h-3 text-green-600 flex-shrink-0" />
              </div>
              <button
                onClick={() => copyToClipboard(liveUrl)}
                className="p-2 rounded-lg hover:bg-foreground/10 transition-colors flex-shrink-0"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {deploymentInfo?.status === 'failed' && deploymentInfo.error_message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 mb-1">Deployment Failed</p>
              <p className="text-xs text-red-600">{deploymentInfo.error_message}</p>
            </div>
          </motion.div>
        )}

        {/* Last Deployed */}
        {deploymentInfo?.last_deployed_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Clock className="w-3 h-3" />
            <span>Last deployed {formatTime(deploymentInfo.last_deployed_at)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {deploymentInfo?.status === 'not_deployed' || deploymentInfo?.status === 'failed' ? (
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Rocket className="w-4 h-4" />
              {isDeploying ? 'Deploying...' : 'Deploy Website'}
            </button>
          ) : deploymentInfo?.status === 'deployed' ? (
            <button
              onClick={handleRedeploy}
              disabled={isDeploying}
              className="flex items-center gap-2 px-4 py-2.5 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              {isDeploying ? 'Deploying...' : 'Redeploy'}
            </button>
          ) : null}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        {/* Details Section */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border space-y-3"
            >
              <DetailRow label="Website Name" value={websiteName} />
              <DetailRow
                label="Subdomain"
                value={deploymentInfo?.subdomain || 'Not assigned'}
              />
              {deploymentInfo?.custom_domain && (
                <DetailRow label="Custom Domain" value={deploymentInfo.custom_domain} />
              )}
              <DetailRow
                label="Deployment URL"
                value={liveUrl || 'Not deployed'}
                copyable={!!liveUrl}
                onCopy={() => liveUrl && copyToClipboard(liveUrl)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
}

function DetailRow({ label, value, copyable, onCopy }: DetailRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground font-mono">{value}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-foreground/10 transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
