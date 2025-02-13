import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderService, type Order } from '@/services/orderService';
import { useStore } from '@/hooks/useStore';
import { useCustomer } from '@/hooks/useCustomer';

// Cache key for localStorage
const ORDERS_CACHE_KEY = 'cached_orders';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useOrders = (page: number = 1, limit: number = 10) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeName } = useStore();
  const { customer } = useCustomer();

  // Use React Query for data fetching and caching
  const { 
    data, 
    isLoading: ordersLoading, 
    isError: ordersError,
    refetch: refetchData
  } = useQuery({
    queryKey: ['orders', storeName, customer?.id, page, limit],
    queryFn: () => OrderService.getOrders(storeName, page, limit, customer?.id),
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    enabled: !!customer?.id, // Only fetch when customer ID is available
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

  // Calculate pagination details
  const totalPages = Math.ceil((data?.total || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return { 
    orders: data?.orders || [], 
    loading, 
    error,
    refreshOrders,
    isLoading: ordersLoading,
    isError: ordersError,
    // Pagination data
    currentPage: page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    totalItems: data?.total || 0
  };
};

export type { Order };
