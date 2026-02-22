import { useState, useEffect, useCallback } from 'react';
import { getHealthStatus } from '@/api/health';
import type { HealthStatus } from '@/types';

export interface UseHealthPollReturn {
  health: HealthStatus | null;
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHealthPoll(intervalMs: number = 30000): UseHealthPollReturn {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const data = await getHealthStatus();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    
    const interval = setInterval(fetchHealth, intervalMs);
    return () => clearInterval(interval);
  }, [fetchHealth, intervalMs]);

  const isOnline = health?.status === 'ok';

  return {
    health,
    isOnline,
    isLoading,
    error,
    refetch: fetchHealth
  };
}
