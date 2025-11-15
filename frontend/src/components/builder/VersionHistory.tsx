import { useEffect } from 'react';
import { useWebsiteStore } from '@/store/websiteStore';
import { Clock, RotateCcw, Loader, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  websiteId: string;
}

export function VersionHistory({ websiteId }: VersionHistoryProps) {
  const { versions, loadVersions, restoreVersion, isLoadingVersions } = useWebsiteStore();

  useEffect(() => {
    if (websiteId) {
      loadVersions(websiteId);
    }
  }, [websiteId, loadVersions]);

  const handleRestore = async (versionId: string) => {
    try {
      await restoreVersion(websiteId, versionId);
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  return (
    <div className="w-72 bg-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-text">Version History</h3>
        </div>
        <p className="text-xs text-text-muted">
          Restore previous versions of your website
        </p>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingVersions ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">No version history yet</p>
            <p className="text-xs text-text-muted mt-1">
              Versions are saved automatically
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="bg-background border border-border rounded-lg p-3 hover:border-accent transition-colors"
              >
                {/* Version Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-text">
                        Version {version.version_number}
                      </div>
                      <div className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(version.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {version.change_description && (
                  <p className="text-xs text-text-muted mb-3 line-clamp-2">
                    {version.change_description}
                  </p>
                )}

                {/* Restore Button */}
                {index !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(version.id)}
                    className="w-full gap-2 text-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore this version
                  </Button>
                )}

                {index === 0 && (
                  <div className="text-xs text-center text-green-500 font-medium">
                    Current Version
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
