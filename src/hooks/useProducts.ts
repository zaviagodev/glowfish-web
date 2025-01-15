import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService, type Product } from '@/services/productService';

// Cache key for localStorage
const PRODUCTS_CACHE_KEY = 'cached_products';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useProducts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for data fetching and caching
  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getProducts,
    staleTime: CACHE_EXPIRY_TIME, // Consider data fresh for 5 minutes
    cacheTime: CACHE_EXPIRY_TIME * 2, // Keep cache for 10 minutes
    retry: 2, // Retry failed requests twice
    onError: (err: any) => {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    }
  });

  // Update loading state based on React Query
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Update error state based on React Query
  useEffect(() => {
    if (isError) {
      setError('Failed to fetch products');
    } else {
      setError(null);
    }
  }, [isError]);

  // Function to force refresh the data
  const refreshProducts = async () => {
    setLoading(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing products:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh products');
    } finally {
      setLoading(false);
    }
  };

  return { 
    products, 
    loading, 
    error, 
    refreshProducts,
    isLoading,
    isError
  };
};

export type { Product };