import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService, type Product } from '@/features/home/services/productService';
import { useStore } from '@/hooks/useStore';

const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useRewards = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeName } = useStore();

  const {
    data: rewards = [],
    isLoading: rewardsLoading,
    isError: rewardsError,
    refetch: refetchRewards
  } = useQuery({
    queryKey: ['rewards', storeName],
    queryFn: () => ProductService.getRewards(storeName),
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    onError: (err: any) => {
      console.error('Error fetching rewards:', err);
      setError(err.message || 'Failed to load rewards');
    }
  });

  useEffect(() => {
    setLoading(rewardsLoading);
  }, [rewardsLoading]);

  useEffect(() => {
    if (rewardsError) {
      setError('Failed to fetch rewards');
    } else {
      setError(null);
    }
  }, [rewardsError]);

  const refreshRewards = async () => {
    setLoading(true);
    try {
      await refetchRewards();
    } catch (err) {
      console.error('Error refreshing rewards:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh rewards');
    } finally {
      setLoading(false);
    }
  };

  return {
    rewards,
    loading,
    error,
    refreshRewards,
    isLoading: rewardsLoading,
    isError: rewardsError
  };
}; 