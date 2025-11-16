/**
 * Portfolio Showcase Page
 * Display AI-generated demo websites for developer accounts
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../hooks/usePortfolio';
import { Sparkles, Eye, EyeOff, Trash2, RefreshCw, Star, Calendar, Code } from 'lucide-react';
import { TopNav } from '../components/builder/TopNav';

export default function Portfolio() {
  const {
    portfolio,
    isLoading,
    isGenerating,
    error,
    generatePortfolio,
    regeneratePortfolio,
    updateVisibility,
    deleteWebsite,
  } = usePortfolio();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);

  const handleGenerate = async () => {
    try {
      await generatePortfolio(10);
      setShowGenerateModal(false);
      alert('Portfolio generated successfully! 🎉');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRegenerate = async () => {
    if (confirm('This will delete your current portfolio and generate a new one. Continue?')) {
      try {
        await regeneratePortfolio();
        alert('Portfolio regenerated successfully! 🎉');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      await updateVisibility(id, !currentVisibility);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}" from portfolio?`)) {
      try {
        await deleteWebsite(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const featuredWebsites = portfolio.filter(w => w.is_featured);
  const regularWebsites = portfolio.filter(w => !w.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Portfolio Showcase</h1>
              <p className="text-muted-foreground">
                AI-generated demo websites to showcase your capabilities
              </p>
            </div>
            <div className="flex gap-3">
              {portfolio.length > 0 && (
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate Portfolio
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading portfolio...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium mb-2">Error loading portfolio</p>
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && portfolio.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate Your Portfolio</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Let AI create 10 stunning demo websites across different categories to showcase your abilities to potential clients
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              disabled={isGenerating}
              className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 transition shadow-xl disabled:opacity-50"
            >
              <Sparkles className="w-6 h-6" />
              {isGenerating ? 'Generating...' : 'Generate Portfolio'}
            </button>
            {isGenerating && (
              <p className="text-gray-600 mt-4">This may take a few minutes...</p>
            )}
          </div>
        )}

        {/* Portfolio Grid */}
        {!isLoading && portfolio.length > 0 && (
          <div className="space-y-12">
            {/* Featured Section */}
            {featuredWebsites.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredWebsites.map((website, index) => (
                    <PortfolioCard
                      key={website.id}
                      website={website}
                      index={index}
                      onToggleVisibility={handleToggleVisibility}
                      onDelete={handleDelete}
                      onPreview={setSelectedWebsite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Portfolio */}
            {regularWebsites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Projects</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularWebsites.map((website, index) => (
                    <PortfolioCard
                      key={website.id}
                      website={website}
                      index={index + featuredWebsites.length}
                      onToggleVisibility={handleToggleVisibility}
                      onDelete={handleDelete}
                      onPreview={setSelectedWebsite}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Confirmation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <Sparkles className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Generate Portfolio?</h2>
              <p className="text-gray-600">
                AI will create 10 professional demo websites across different categories.
                This may take 5-10 minutes.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedWebsite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedWebsite.name}</h3>
                <p className="text-indigo-100">{selectedWebsite.category}</p>
              </div>
              <button
                onClick={() => setSelectedWebsite(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <iframe
                srcDoc={`${selectedWebsite.html_code}<style>${selectedWebsite.css_code}</style><script>${selectedWebsite.js_code}</script>`}
                className="w-full h-[600px] border border-gray-200 rounded-lg"
                sandbox="allow-scripts"
                title="Website Preview"
              />

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Client</h4>
                  <p className="text-gray-600">{selectedWebsite.fake_client_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Completed</h4>
                  <p className="text-gray-600">
                    {new Date(selectedWebsite.fake_completion_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWebsite.fake_technologies.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedWebsite.fake_testimonial && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Client Testimonial</h4>
                    <p className="text-gray-600 italic">"{selectedWebsite.fake_testimonial}"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Portfolio Card Component
function PortfolioCard({ website, index, onToggleVisibility, onDelete, onPreview }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition group"
    >
      {/* Preview Image or Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Code className="w-16 h-16 text-indigo-300" />
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          {website.is_featured && (
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-900" />
              Featured
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            website.is_visible
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {website.is_visible ? 'Visible' : 'Hidden'}
          </span>
        </div>
        <button
          onClick={() => onPreview(website)}
          className="absolute inset-0 bg-black/0 hover:bg-black/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <Eye className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{website.name}</h3>
          <p className="text-sm text-gray-600">{website.description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(website.fake_completion_date).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            {website.category}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onToggleVisibility(website.id, website.is_visible)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium"
          >
            {website.is_visible ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show
              </>
            )}
          </button>
          <button
            onClick={() => onDelete(website.id, website.name)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
