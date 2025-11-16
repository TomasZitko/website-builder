/**
 * Developer Analytics Dashboard
 * Comprehensive performance metrics for freelancer and agency accounts
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  Users,
  Globe,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Award,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TopNav } from '@/components/builder/TopNav';
import { useDeveloperStats } from '@/hooks/useDeveloperStats';
import { apiClient } from '@/api/client';

interface DeveloperAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      clients: number;
    }>;
    growthRate: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
  websites: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    byStatus: Array<{
      status: string;
      count: number;
    }>;
    byType: Array<{
      type: string;
      count: number;
    }>;
  };
  performance: {
    avgProjectValue: number;
    avgCompletionTime: number;
    clientRetentionRate: number;
    monthlyRecurringRevenue: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'client_added' | 'website_created' | 'revenue_recorded' | 'invitation_sent';
    description: string;
    date: string;
    amount?: number;
  }>;
}

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
};

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function DeveloperAnalytics() {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useDeveloperStats();
  const [analytics, setAnalytics] = useState<DeveloperAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/v1/b2b2c/analytics', {
        params: { timeRange }
      });
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Mock data for development
      setAnalytics({
        revenue: {
          total: 45750,
          thisMonth: 8500,
          lastMonth: 7200,
          monthlyTrend: [
            { month: 'Jan', revenue: 4500, clients: 12 },
            { month: 'Feb', revenue: 5200, clients: 14 },
            { month: 'Mar', revenue: 6100, clients: 15 },
            { month: 'Apr', revenue: 7200, clients: 18 },
            { month: 'May', revenue: 8500, clients: 22 },
            { month: 'Jun', revenue: 9250, clients: 25 }
          ],
          growthRate: 18.1
        },
        clients: {
          total: 25,
          active: 22,
          inactive: 2,
          pending: 1,
          thisMonth: 3,
          lastMonth: 2,
          growthRate: 50
        },
        websites: {
          total: 68,
          thisMonth: 12,
          lastMonth: 9,
          byStatus: [
            { status: 'Live', count: 45 },
            { status: 'In Progress', count: 15 },
            { status: 'Draft', count: 5 },
            { status: 'Archived', count: 3 }
          ],
          byType: [
            { type: 'Business', count: 28 },
            { type: 'Portfolio', count: 18 },
            { type: 'E-commerce', count: 12 },
            { type: 'Landing Page', count: 10 }
          ]
        },
        performance: {
          avgProjectValue: 1830,
          avgCompletionTime: 4.5,
          clientRetentionRate: 88,
          monthlyRecurringRevenue: 7200
        },
        recentActivity: [
          {
            id: '1',
            type: 'revenue_recorded',
            description: 'Payment received from Acme Corp',
            date: '2 hours ago',
            amount: 2500
          },
          {
            id: '2',
            type: 'website_created',
            description: 'New website for TechStart Inc',
            date: '5 hours ago'
          },
          {
            id: '3',
            type: 'client_added',
            description: 'New client: Digital Solutions Ltd',
            date: '1 day ago'
          },
          {
            id: '4',
            type: 'invitation_sent',
            description: 'Invitation sent to john@example.com',
            date: '2 days ago'
          },
          {
            id: '5',
            type: 'revenue_recorded',
            description: 'Monthly subscription from Startup XYZ',
            date: '3 days ago',
            amount: 1200
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load analytics</p>
            <button
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/15 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your performance and growth metrics
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-foreground/5 rounded-lg p-1">
            {[
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: '90d', label: '90 days' },
              { value: '1y', label: '1 year' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-foreground/10 text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(analytics.revenue.total)}
            change={analytics.revenue.growthRate}
            subtext={`${formatCurrency(analytics.revenue.thisMonth)} this month`}
            color="success"
          />
          <MetricCard
            icon={Users}
            label="Active Clients"
            value={analytics.clients.active.toString()}
            change={analytics.clients.growthRate}
            subtext={`${analytics.clients.thisMonth} new this month`}
            color="primary"
          />
          <MetricCard
            icon={Globe}
            label="Total Websites"
            value={analytics.websites.total.toString()}
            change={((analytics.websites.thisMonth - analytics.websites.lastMonth) / analytics.websites.lastMonth * 100)}
            subtext={`${analytics.websites.thisMonth} created this month`}
            color="secondary"
          />
          <MetricCard
            icon={Activity}
            label="MRR"
            value={formatCurrency(analytics.performance.monthlyRecurringRevenue)}
            change={5.2}
            subtext="Monthly Recurring Revenue"
            color="info"
          />
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Revenue Growth</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={analytics.revenue.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: any) => [formatCurrency(value), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ fill: COLORS.success, r: 5 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Website Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl shadow-sm border border-border p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Websites by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.websites.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.websites.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Website Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl shadow-sm border border-border p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Websites by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.websites.byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="type"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PerformanceMetric
              icon={Target}
              label="Avg. Project Value"
              value={formatCurrency(analytics.performance.avgProjectValue)}
              color="success"
            />
            <PerformanceMetric
              icon={Calendar}
              label="Avg. Completion Time"
              value={`${analytics.performance.avgCompletionTime} days`}
              color="info"
            />
            <PerformanceMetric
              icon={Award}
              label="Client Retention"
              value={`${analytics.performance.clientRetentionRate}%`}
              color="warning"
            />
            <PerformanceMetric
              icon={TrendingUp}
              label="Growth Rate"
              value={`+${analytics.revenue.growthRate.toFixed(1)}%`}
              color="success"
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <ActivityIcon type={activity.type} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                  </div>
                </div>
                {activity.amount && (
                  <span className="text-sm font-semibold text-success">
                    +{formatCurrency(activity.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Components

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: number;
  subtext: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

function MetricCard({ icon: Icon, label, value, change, subtext, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-blue-500/10 text-blue-600',
    secondary: 'bg-purple-500/10 text-purple-600',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-orange-500/10 text-orange-600',
    info: 'bg-cyan-500/10 text-cyan-600'
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl shadow-sm border border-border p-6"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-2">{subtext}</p>
      </div>
    </motion.div>
  );
}

interface PerformanceMetricProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

function PerformanceMetric({ icon: Icon, label, value, color }: PerformanceMetricProps) {
  const colorClasses = {
    primary: 'bg-blue-500/10 text-blue-600',
    secondary: 'bg-purple-500/10 text-purple-600',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-orange-500/10 text-orange-600',
    info: 'bg-cyan-500/10 text-cyan-600'
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const iconClasses = "w-10 h-10 rounded-full flex items-center justify-center";

  switch (type) {
    case 'revenue_recorded':
      return (
        <div className={`${iconClasses} bg-green-500/10`}>
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
      );
    case 'website_created':
      return (
        <div className={`${iconClasses} bg-blue-500/10`}>
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
      );
    case 'client_added':
      return (
        <div className={`${iconClasses} bg-purple-500/10`}>
          <Users className="w-5 h-5 text-purple-600" />
        </div>
      );
    case 'invitation_sent':
      return (
        <div className={`${iconClasses} bg-orange-500/10`}>
          <Activity className="w-5 h-5 text-orange-600" />
        </div>
      );
    default:
      return (
        <div className={`${iconClasses} bg-gray-500/10`}>
          <Activity className="w-5 h-5 text-gray-600" />
        </div>
      );
  }
}
