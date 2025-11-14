import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsites } from '../hooks/useWebsites';
import { Plus, Search, Filter, TrendingUp, Eye, Globe, Loader2 } from 'lucide-react';
import { WebsiteCard } from '../components/websites/WebsiteCard';
import { TopNav } from '../components/builder/TopNav';

export function Dashboard() {
  const navigate = useNavigate();
  const { websites, isLoading } = useWebsites();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter websites
  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         website.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || website.deployment_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate total stats
  const totalViews = websites.reduce((sum, w) => sum + w.total_views, 0);
  const totalVisitors = websites.reduce((sum, w) => sum + w.unique_visitors, 0);
  const liveWebsites = websites.filter(w => w.deployment_status === 'live').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Matching Builder */}
      <TopNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Your Websites
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {websites.length} {websites.length === 1 ? 'website' : 'websites'} total
              </p>
            </div>

            {/* New Website Button - Glass Style matching login */}
            <div className="glass-button-wrap rounded-full relative cursor-pointer">
              <button
                onClick={() => navigate('/builder')}
                className="glass-button relative z-10 text-base font-medium"
              >
                <span className="glass-button-text relative block select-none tracking-tighter px-6 py-2.5">
                  <span className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Website
                  </span>
                </span>
              </button>
              <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
          </div>

          {/* Stats Overview - Glass Cards matching login testimonials */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Live Websites Stat */}
            <div className="glass-testimonial-card">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-foreground/70" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Live Websites
                  </dt>
                  <dd className="text-3xl font-bold text-foreground mt-1">
                    {liveWebsites}
                  </dd>
                </div>
              </div>
            </div>

            {/* Total Views Stat */}
            <div className="glass-testimonial-card">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-foreground/70" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Total Views
                  </dt>
                  <dd className="text-3xl font-bold text-foreground mt-1">
                    {totalViews.toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>

            {/* Unique Visitors Stat */}
            <div className="glass-testimonial-card">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-foreground/70" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Unique Visitors
                  </dt>
                  <dd className="text-3xl font-bold text-foreground mt-1">
                    {totalVisitors.toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Glass Inputs matching login */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
              <div className="luxury-glass-input relative z-10 flex items-center h-12 rounded-full">
                <span className="luxury-glass-input-text px-5 py-2.5 w-full flex items-center gap-3">
                  <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search websites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                  />
                </span>
              </div>
              <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="sm:w-48">
            <div className="luxury-glass-input-wrap cursor-pointer rounded-full relative">
              <div className="luxury-glass-input relative z-10 flex items-center h-12 rounded-full">
                <span className="luxury-glass-input-text px-5 py-2.5 w-full flex items-center gap-3">
                  <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-foreground text-base appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="deploying">Deploying</option>
                    <option value="live">Live</option>
                    <option value="failed">Failed</option>
                  </select>
                </span>
              </div>
              <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Websites Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading websites...</p>
            </div>
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {websites.length === 0 ? 'No websites yet' : 'No websites found'}
              </h3>
              <p className="text-base text-muted-foreground mb-6">
                {websites.length === 0
                  ? 'Get started by creating your first website'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {websites.length === 0 && (
                <div className="glass-button-wrap rounded-full relative cursor-pointer inline-block">
                  <button
                    onClick={() => navigate('/builder')}
                    className="glass-button relative z-10 text-base font-medium"
                  >
                    <span className="glass-button-text relative block select-none tracking-tighter px-6 py-2.5">
                      <span className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Website
                      </span>
                    </span>
                  </button>
                  <div className="glass-button-shadow rounded-full pointer-events-none"></div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWebsites.map((website) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
