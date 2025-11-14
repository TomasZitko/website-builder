/**
 * ActivityFeed Component
 * Displays recent user activity with animations
 * Includes loading states and empty states
 */

import { motion } from 'framer-motion';
import {
  IconCheck,
  IconFileText,
  IconEdit,
  IconTrash,
  IconUpload,
  IconDownload
} from '@tabler/icons-react';

interface Activity {
  id: string;
  type: 'created' | 'edited' | 'deleted' | 'published' | 'downloaded';
  message: string;
  timestamp: string;
  projectName?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  isLoading?: boolean;
  maxItems?: number;
}

const activityIcons = {
  created: IconFileText,
  edited: IconEdit,
  deleted: IconTrash,
  published: IconUpload,
  downloaded: IconDownload
};

const activityColors = {
  created: 'text-blue-500 bg-blue-500/10',
  edited: 'text-violet-500 bg-violet-500/10',
  deleted: 'text-red-500 bg-red-500/10',
  published: 'text-green-500 bg-green-500/10',
  downloaded: 'text-orange-500 bg-orange-500/10'
};

// Mock data for demonstration
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'created',
    message: 'Created new website',
    projectName: 'My Portfolio',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: '2',
    type: 'edited',
    message: 'Updated homepage design',
    projectName: 'Business Site',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: '3',
    type: 'published',
    message: 'Published to subdomain',
    projectName: 'Landing Page',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: '4',
    type: 'downloaded',
    message: 'Downloaded website files',
    projectName: 'E-commerce Store',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityFeed({
  activities = mockActivities,
  isLoading = false,
  maxItems = 5
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 rounded-xl bg-foreground/5 animate-pulse"
          >
            <div className="w-10 h-10 rounded-lg bg-foreground/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-foreground/10 rounded w-3/4" />
              <div className="h-3 bg-foreground/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (displayedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
          <IconCheck className="w-8 h-8 text-foreground/20" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No recent activity
        </h3>
        <p className="text-sm text-foreground/60">
          Your activity will appear here once you start creating websites
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedActivities.map((activity, idx) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="
              group flex items-start gap-4 p-4 rounded-xl
              bg-gradient-to-br from-background/60 to-background/40
              backdrop-blur-xl border border-foreground/[0.08]
              hover:border-foreground/[0.12]
              transition-all duration-300
              hover:shadow-lg
            "
          >
            {/* Icon */}
            <div className={`p-2.5 rounded-lg ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.message}
              </p>
              {activity.projectName && (
                <p className="text-xs text-foreground/60 mt-0.5">
                  {activity.projectName}
                </p>
              )}
              <p className="text-xs text-foreground/40 mt-1">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>

            {/* Indicator dot */}
            <div className="w-2 h-2 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        );
      })}

      {/* View All Link */}
      {activities.length > maxItems && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full py-3 text-sm font-medium text-violet-500 hover:text-violet-600 transition-colors"
        >
          View all activity ({activities.length})
        </motion.button>
      )}
    </div>
  );
}
