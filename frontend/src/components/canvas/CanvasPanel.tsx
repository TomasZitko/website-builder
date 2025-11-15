import { useState } from 'react';
import { motion } from 'framer-motion';
import { PreviewFrame } from './PreviewFrame';
import { useWebsiteStore } from '@/store/websiteStore';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { Button } from '@/components/ui/Button';
import {
  Monitor,
  Tablet,
  Smartphone,
  Code,
  Eye,
  Download,
  Share2,
  Loader2
} from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type ViewMode = 'preview' | 'code';

export function CanvasPanel() {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { htmlCode, cssCode, jsCode, isGenerating, websiteId, websiteName, isPaid } = useWebsiteStore();

  const deviceSizes = {
    desktop: { width: '100%', height: '100%', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  };

  const hasCode = htmlCode || cssCode || jsCode;

  const DeviceIcon = deviceSizes[device].icon;

  return (
    <div className="h-screen flex flex-col bg-panel">
      {/* Toolbar */}
      <div className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="flex items-center gap-1 bg-panel border border-border rounded-lg p-1">
            {(Object.keys(deviceSizes) as DeviceType[]).map((d) => {
              const Icon = deviceSizes[d].icon;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`p-2 rounded transition-colors ${
                    device === d
                      ? 'bg-accent text-white'
                      : 'text-text-muted hover:text-text hover:bg-border'
                  }`}
                  title={d.charAt(0).toUpperCase() + d.slice(1)}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-panel border border-border rounded-lg p-1 ml-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-2 rounded transition-colors text-sm font-medium flex items-center gap-2 ${
                viewMode === 'preview'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text hover:bg-border'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-2 rounded transition-colors text-sm font-medium flex items-center gap-2 ${
                viewMode === 'code'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text hover:bg-border'
              }`}
            >
              <Code className="w-4 h-4" />
              Code
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled={!hasCode}>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          {isPaid ? (
            <Button variant="default" size="sm" className="gap-2" disabled={!hasCode}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              disabled={!hasCode || !websiteId}
              onClick={() => setShowPaymentModal(true)}
            >
              <Download className="w-4 h-4" />
              Download €7.99
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              Generating Your Website...
            </h3>
            <p className="text-text-muted text-sm">
              This usually takes 10-15 seconds
            </p>
          </div>
        ) : !hasCode ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-panel border-2 border-dashed border-border flex items-center justify-center mb-4">
              <DeviceIcon className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">
              No Website Yet
            </h3>
            <p className="text-text-muted text-sm max-w-sm">
              Complete the questionnaire or chat with the AI to generate your website
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full flex items-center justify-center"
          >
            {viewMode === 'preview' ? (
              <div
                className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
                style={{
                  width: deviceSizes[device].width,
                  height: deviceSizes[device].height,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <PreviewFrame />
              </div>
            ) : (
              <div className="w-full h-full max-w-5xl">
                <div className="grid grid-cols-1 gap-4 h-full">
                  {/* HTML */}
                  {htmlCode && (
                    <div className="bg-background border border-border rounded-lg overflow-hidden">
                      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-sm font-medium text-text">HTML</span>
                        <button className="text-xs text-accent hover:underline">
                          Copy
                        </button>
                      </div>
                      <pre className="p-4 text-sm text-text overflow-auto max-h-64">
                        <code>{htmlCode}</code>
                      </pre>
                    </div>
                  )}

                  {/* CSS */}
                  {cssCode && (
                    <div className="bg-background border border-border rounded-lg overflow-hidden">
                      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-sm font-medium text-text">CSS</span>
                        <button className="text-xs text-accent hover:underline">
                          Copy
                        </button>
                      </div>
                      <pre className="p-4 text-sm text-text overflow-auto max-h-64">
                        <code>{cssCode}</code>
                      </pre>
                    </div>
                  )}

                  {/* JavaScript */}
                  {jsCode && (
                    <div className="bg-background border border-border rounded-lg overflow-hidden">
                      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-sm font-medium text-text">JavaScript</span>
                        <button className="text-xs text-accent hover:underline">
                          Copy
                        </button>
                      </div>
                      <pre className="p-4 text-sm text-text overflow-auto max-h-64">
                        <code>{jsCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      {websiteId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          websiteId={websiteId}
          websiteName={websiteName}
        />
      )}
    </div>
  );
}
