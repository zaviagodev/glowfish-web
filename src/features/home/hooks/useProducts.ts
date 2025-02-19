import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/features/home/services/productService';
import { Product, Category, ProductQueryResult } from '../types/product.types';
import { useStore } from '@/hooks/useStore';
import { CACHE_EXPIRY_TIME, useQueryState, handleError } from '../utils/hookUtils';
import { transformProduct, transformCategory } from '../transformers/productTransformer';

export const useProducts = (): ProductQueryResult => {
  const { storeName } = useStore();

  const { 
    data: productsData = [], 
    isLoading: productsLoading, 
    isError: productsError,
    refetch: refetchProducts 
  } = useQuery({
    queryKey: ['products', storeName],
    queryFn: async () => {
      const data = await ProductService.getProducts(storeName);
      return (data || []).map(transformProduct);
    },
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
  });

  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['categories', storeName],
    queryFn: async () => {
      const data = await ProductService.getCategories(storeName);
      return (data || []).map(transformCategory);
    },
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
  });

  const { loading, error } = useQueryState(
    productsLoading || categoriesLoading,
    productsError || categoriesError
  );

  const refreshData = async () => {
    try {
      await Promise.all([
        refetchProducts(),
        refetchCategories()
      ]);
    } catch (err) {
      handleError(err);
    }
  };

  return { 
    products: productsData, 
    categories: categoriesData,
    loading, 
    error, 
    refreshData,
    isLoading: productsLoading || categoriesLoading,
    isError: productsError || categoriesError
  };
};

export type { Product, Category };