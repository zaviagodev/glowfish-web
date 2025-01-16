import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService, type Product, type Category } from '@/services/productService';

// Cache key for localStorage
const PRODUCTS_CACHE_KEY = 'cached_products';
const CATEGORIES_CACHE_KEY = 'cached_categories';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useProducts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for products data fetching and caching
  const { 
    data: products = [], 
    isLoading: productsLoading, 
    isError: productsError,
    refetch: refetchProducts 
  } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getProducts,
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    onError: (err: any) => {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    }
  });

  // Use React Query for categories data fetching and caching
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: ProductService.getCategories,
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    onError: (err: any) => {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    }
  });

  // Update loading state based on both queries
  useEffect(() => {
    setLoading(productsLoading || categoriesLoading);
  }, [productsLoading, categoriesLoading]);

  // Update error state based on both queries
  useEffect(() => {
    if (productsError || categoriesError) {
      setError('Failed to fetch data');
    } else {
      setError(null);
    }
  }, [productsError, categoriesError]);

  // Function to force refresh all data
  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        refetchProducts(),
        refetchCategories()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return { 
    products, 
    categories,
    loading, 
    error, 
    refreshData,
    isLoading: productsLoading || categoriesLoading,
    isError: productsError || categoriesError
  };
};

export type { Product, Category };