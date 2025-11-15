import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Users,
  Clock,
  Globe,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiClient } from '../api/client';

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgDuration: number;
    bounceRate: number;
  };
  timeline: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    uniqueVisitors: number;
  }>;
  devices: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  browsers: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  countries: Array<{
    country: string;
    views: number;
  }>;
  referrers: Array<{
    source: string;
    visits: number;
  }>;
}

interface Website {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  deployment_url?: string;
  deployment_status: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function Analytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [website, setWebsite] = useState<Website | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load website details
      const websiteResponse = await apiClient.get(`/api/v1/websites/${id}`);
      setWebsite(websiteResponse.data.website);

      // Load analytics data
      const analyticsResponse = await apiClient.get(`/api/v1/analytics/${id}`, {
        params: { timeRange }
      });
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, timeRange]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!website || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Website not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const domain = website.custom_domain || `${website.subdomain}.webchat.cz`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {website.name}
                </h1>
                <div className="flex items-center mt-1 space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{domain}</span>
                  {website.deployment_status === 'live' && website.deployment_url && (
                    <a
                      href={website.deployment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { value: '7d', label: '7 days' },
                { value: '30d', label: '30 days' },
                { value: '90d', label: '90 days' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === option.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Eye}
            label="Total Views"
            value={formatNumber(analytics.overview.totalViews)}
            color="indigo"
          />
          <StatCard
            icon={Users}
            label="Unique Visitors"
            value={formatNumber(analytics.overview.uniqueVisitors)}
            color="purple"
          />
          <StatCard
            icon={Clock}
            label="Avg. Duration"
            value={formatDuration(analytics.overview.avgDuration)}
            color="pink"
          />
          <StatCard
            icon={TrendingUp}
            label="Bounce Rate"
            value={`${analytics.overview.bounceRate}%`}
            color="orange"
          />
        </div>

        {/* Views Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Views Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1' }}
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6' }}
                name="Visitors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Pages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Pages
            </h2>
            <div className="space-y-3">
              {analytics.topPages.map((page) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {page.page}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {page.uniqueVisitors} unique visitors
                    </p>
                  </div>
                  <span className="ml-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatNumber(page.views)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Devices
            </h2>
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.devices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.devices.map((entry, index) => (
                      <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center space-x-6">
              {analytics.devices.map((device, index) => (
                <div key={device.type} className="flex items-center">
                  {device.type === 'desktop' && <Monitor className="w-4 h-4 mr-2" style={{ color: COLORS[index] }} />}
                  {device.type === 'mobile' && <Smartphone className="w-4 h-4 mr-2" style={{ color: COLORS[index] }} />}
                  {device.type === 'tablet' && <Tablet className="w-4 h-4 mr-2" style={{ color: COLORS[index] }} />}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {device.type}: {device.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Referrers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Referrers
            </h2>
            <div className="space-y-3">
              {analytics.referrers.length > 0 ? (
                analytics.referrers.map((referrer, index) => (
                  <div key={`${referrer.source || 'direct'}-${index}`} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white truncate">
                      {referrer.source || 'Direct'}
                    </span>
                    <span className="ml-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatNumber(referrer.visits)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No referrer data yet
                </p>
              )}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Countries
            </h2>
            <div className="space-y-3">
              {analytics.countries.length > 0 ? (
                analytics.countries.map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {country.country}
                      </span>
                    </div>
                    <span className="ml-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatNumber(country.views)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No geographic data yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'indigo' | 'purple' | 'pink' | 'orange';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
