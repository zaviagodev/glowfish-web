// src/hooks/useCustomer.ts
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerService, type Customer } from '@/services/customerService';

// Cache key for localStorage
const CUSTOMERS_CACHE_KEY = 'cached_customers';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useCustomer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for data fetching and caching
  const { 
    data: result = { customers: [], tiers: [] }, 
    isLoading: customersLoading, 
    isError: customersError,
    refetch: refetchData
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const [customersData, tiersData] = await Promise.all([
        CustomerService.getCustomers(),
        CustomerService.getCustomerTiers()
      ]);
      return {
        customers: customersData,
        tiers: tiersData
      };
    },
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    onError: (err: any) => {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to load customers');
    }
  });

  // Update loading state based on React Query
  useEffect(() => {
    setLoading(customersLoading);
  }, [customersLoading]);

  // Update error state based on React Query
  useEffect(() => {
    if (customersError) {
      setError('Failed to fetch customers or tiers');
    } else {
      setError(null);
    }
  }, [customersError]);

  // Function to force refresh the data
  const refreshCustomer = async () => {
    setLoading(true);
    try {
      await refetchData();
    } catch (err) {
      console.error('Error refreshing customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh customers');
    } finally {
      setLoading(false);
    }
  };
  return { 
    customer: result.customers, 
    tiers: result.tiers,
    loading, 
    error, 
    refreshCustomer,
    isLoading: customersLoading,
    isError: customersError
  };
};

export type { Customer };
