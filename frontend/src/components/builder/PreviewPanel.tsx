import { useState } from 'react';
import { X, Eye, Code as CodeIcon, Ruler, Monitor, Tablet, Smartphone, Download, Share2 } from 'lucide-react';
import { PreviewFrame } from '@/components/canvas/PreviewFrame';
import { useWebsiteStore } from '@/store/websiteStore';
import { Button } from '@/components/ui/button';
import { DeployButton } from '@/components/deployment/DeployButton';

type Tab = 'preview' | 'code' | 'dimensions';
type Device = 'desktop' | 'tablet' | 'mobile';

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewPanel({ isOpen, onClose }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [device, setDevice] = useState<Device>('desktop');
  const { htmlCode, cssCode, jsCode, websiteId, websiteName } = useWebsiteStore();

  const deviceSizes = {
    desktop: { width: '100%', height: '100%', label: 'Desktop', icon: Monitor },
    tablet: { width: '768px', height: '1024px', label: 'Tablet', icon: Tablet },
    mobile: { width: '375px', height: '667px', label: 'Mobile', icon: Smartphone },
  };

  const tabs = [
    { id: 'preview' as Tab, label: 'Preview', icon: Eye },
    { id: 'code' as Tab, label: 'Code', icon: CodeIcon },
    { id: 'dimensions' as Tab, label: 'Dimensions', icon: Ruler },
  ];

  return (
    <div className="h-screen w-full border-l border-border bg-background flex flex-col">
      {/* Header with Tabs */}
      <div className="h-[50px] border-b border-border flex items-center justify-between px-4 bg-background shrink-0">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent text-white'
                      : 'text-text-muted hover:text-text hover:bg-panel'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-panel transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

      {/* Toolbar (for Preview tab) */}
      {activeTab === 'preview' && (
        <div className="h-[50px] border-b border-border flex items-center justify-between px-4 bg-panel shrink-0">
              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                {(Object.keys(deviceSizes) as Device[]).map((d) => {
                  const DeviceIcon = deviceSizes[d].icon;
                  return (
                    <button
                      key={d}
                      onClick={() => setDevice(d)}
                      className={`p-2 rounded transition-colors ${
                        device === d
                          ? 'bg-accent text-white'
                          : 'text-text-muted hover:text-text hover:bg-panel'
                      }`}
                      title={deviceSizes[d].label}
                    >
                      <DeviceIcon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {websiteId && (
                  <DeployButton
                    projectId={websiteId}
                    projectName={websiteName || 'my-website'}
                  />
                )}
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="default" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-panel">
        {activeTab === 'preview' && (
          <div className="h-full flex items-center justify-center">
            <div
              className="bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{
                width: deviceSizes[device].width,
                height: deviceSizes[device].height,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              <PreviewFrame />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* HTML */}
            {htmlCode && (
              <div className="bg-background border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-panel">
                  <span className="text-sm font-semibold text-text">HTML</span>
                  <button className="text-xs text-accent hover:underline">Copy</button>
                </div>
                <pre className="p-4 text-sm text-text overflow-auto max-h-96 bg-gray-900 text-gray-100">
                  <code>{htmlCode}</code>
                </pre>
              </div>
            )}

            {/* CSS */}
            {cssCode && (
              <div className="bg-background border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-panel">
                  <span className="text-sm font-semibold text-text">CSS</span>
                  <button className="text-xs text-accent hover:underline">Copy</button>
                </div>
                <pre className="p-4 text-sm text-text overflow-auto max-h-96 bg-gray-900 text-gray-100">
                  <code>{cssCode}</code>
                </pre>
              </div>
            )}

            {/* JavaScript */}
            {jsCode && (
              <div className="bg-background border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-panel">
                  <span className="text-sm font-semibold text-text">JavaScript</span>
                  <button className="text-xs text-accent hover:underline">Copy</button>
                </div>
                <pre className="p-4 text-sm text-text overflow-auto max-h-96 bg-gray-900 text-gray-100">
                  <code>{jsCode}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dimensions' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Viewport Dimensions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-accent" />
                    <span className="font-medium text-text">Desktop</span>
                  </div>
                  <span className="text-text-muted">1920 × 1080 px</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <div className="flex items-center gap-3">
                    <Tablet className="w-5 h-5 text-accent" />
                    <span className="font-medium text-text">Tablet</span>
                  </div>
                  <span className="text-text-muted">768 × 1024 px</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-accent" />
                    <span className="font-medium text-text">Mobile</span>
                  </div>
                  <span className="text-text-muted">375 × 667 px</span>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Responsive Breakpoints</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 hover:bg-panel rounded transition-colors">
                  <span className="text-text-muted">Mobile</span>
                  <span className="font-mono text-text">0 - 767px</span>
                </div>
                <div className="flex justify-between p-2 hover:bg-panel rounded transition-colors">
                  <span className="text-text-muted">Tablet</span>
                  <span className="font-mono text-text">768px - 1023px</span>
                </div>
                <div className="flex justify-between p-2 hover:bg-panel rounded transition-colors">
                  <span className="text-text-muted">Desktop</span>
                  <span className="font-mono text-text">1024px+</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
