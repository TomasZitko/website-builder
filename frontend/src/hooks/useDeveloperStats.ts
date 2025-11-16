/**
 * React Hook for Developer Statistics
 */

import { useState, useEffect } from 'react';
import { statsApi } from '../api/b2b2c';

interface DeveloperStats {
  total_clients: number;
  active_clients: number;
  total_websites: number;
  total_revenue: number;
  websites_this_month: number;
}

export function useDeveloperStats() {
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await statsApi.getDeveloperStats();
      setStats(response.data.stats);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
