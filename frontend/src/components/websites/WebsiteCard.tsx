import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsites, Website } from '../../hooks/useWebsites';
import {
  ExternalLink,
  Edit,
  Trash2,
  BarChart,
  Rocket,
  MoreVertical,
  Globe,
  Clock,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface WebsiteCardProps {
  website: Website;
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  const navigate = useNavigate();
  const { deployWebsite, deleteWebsite } = useWebsites();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await deployWebsite(website.id);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      await deleteWebsite(website.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const getStatusBadge = () => {
    const statuses = {
      draft: { color: 'text-muted-foreground bg-foreground/5', icon: Clock, text: 'Draft' },
      deploying: { color: 'text-yellow-600 bg-yellow-500/10', icon: Loader, text: 'Deploying' },
      live: { color: 'text-green-600 bg-green-500/10', icon: CheckCircle, text: 'Live' },
      failed: { color: 'text-red-600 bg-red-500/10', icon: AlertCircle, text: 'Failed' },
      archived: { color: 'text-muted-foreground bg-foreground/5', icon: AlertCircle, text: 'Archived' }
    };

    const status = statuses[website.deployment_status] || statuses.draft;
    const Icon = status.icon;

    return (
      <span className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-xl border border-foreground/10
        ${status.color}
      `}>
        <Icon className={`w-3 h-3 mr-1.5 ${website.deployment_status === 'deploying' ? 'animate-spin' : ''}`} />
        {status.text}
      </span>
    );
  };

  const domain = website.custom_domain || `${website.subdomain}.webchat.cz`;

  return (
    <div className="glass-testimonial-card group cursor-pointer">
      {/* Preview Image */}
      <div className="aspect-video bg-gradient-to-br from-foreground/10 to-foreground/5 relative overflow-hidden rounded-xl mb-4">
        {website.preview_image_url ? (
          <img
            src={website.preview_image_url}
            alt={website.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-16 h-16 text-foreground/30" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {website.deployment_status === 'live' && (
            <a
              href={website.deployment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button-wrap rounded-full relative cursor-pointer inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="glass-button relative z-10 text-sm font-medium">
                <span className="glass-button-text relative block select-none tracking-tighter px-5 py-2">
                  <span className="flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open Site
                  </span>
                </span>
              </button>
              <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </a>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate mb-1">
              {website.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate flex items-center">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              {domain}
            </p>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-background/95 backdrop-blur-xl border border-border z-20 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder/${website.id}`);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-foreground/5 flex items-center transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-3" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(website.deployment_url, '_blank');
                        setShowMenu(false);
                      }}
                      disabled={website.deployment_status !== 'live'}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-foreground/5 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-3" />
                      View Live
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/analytics/${website.id}`);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-foreground/5 flex items-center transition-colors"
                    >
                      <BarChart className="w-4 h-4 mr-3" />
                      Analytics
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-500/10 flex items-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      {showDeleteConfirm ? 'Confirm Delete?' : 'Delete'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Eye className="w-4 h-4 mr-1.5" />
            <span className="font-medium">{website.total_views.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <TrendingUp className="w-4 h-4 mr-1.5" />
            <span className="font-medium">{website.unique_visitors.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {website.deployment_status === 'draft' || website.deployment_status === 'failed' ? (
            <div className="glass-button-wrap rounded-full relative cursor-pointer flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeploy();
                }}
                disabled={isDeploying}
                className="glass-button relative z-10 text-sm font-medium w-full"
              >
                <span className="glass-button-text relative block select-none tracking-tighter px-4 py-2">
                  <span className="flex items-center justify-center gap-2">
                    {isDeploying ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Deploy
                      </>
                    )}
                  </span>
                </span>
              </button>
              <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
          ) : (
            <div className="glass-button-wrap rounded-full relative cursor-pointer flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/builder/${website.id}`);
                }}
                className="glass-button relative z-10 text-sm font-medium w-full"
              >
                <span className="glass-button-text relative block select-none tracking-tighter px-4 py-2">
                  <span className="flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </span>
                </span>
              </button>
              <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/analytics/${website.id}`);
            }}
            className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors border border-border"
          >
            <BarChart className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Deployment Date */}
      {website.deployed_at && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center">
            <Clock className="w-3 h-3 mr-1.5" />
            Last deployed {new Date(website.deployed_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
