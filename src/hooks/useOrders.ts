import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderService, type Order } from '@/services/orderService';
import { useStore } from '@/hooks/useStore';

// Cache key for localStorage
const ORDERS_CACHE_KEY = 'cached_orders';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useOrders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeName } = useStore();

  // Use React Query for data fetching and caching
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    isError: ordersError,
    refetch: refetchData
  } = useQuery({
    queryKey: ['orders', storeName],
    queryFn: () => OrderService.getOrders(storeName),
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    onError: (err: any) => {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    }
  });

  // Update loading state based on React Query
  useEffect(() => {
    setLoading(ordersLoading);
  }, [ordersLoading]);

  // Update error state based on React Query
  useEffect(() => {
    if (ordersError) {
      setError('Failed to fetch orders');
    } else {
      setError(null);
    }
  }, [ordersError]);

  // Function to force refresh the data
  const refreshOrders = async () => {
    setLoading(true);
    try {
      await refetchData();
    } catch (err) {
      console.error('Error refreshing orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  return { 
    orders, 
    loading, 
    error, 
    refreshOrders,
    isLoading: ordersLoading,
    isError: ordersError
  };
};

export type { Order };
