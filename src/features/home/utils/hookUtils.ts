import { useState, useEffect } from 'react';

export const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface QueryState {
  loading: boolean;
  error: string | null;
}

export const useQueryState = (isLoading: boolean, isError: boolean): QueryState => {
  const [state, setState] = useState<QueryState>({
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState({
      loading: isLoading,
      error: isError ? 'Failed to fetch data' : null,
    });
  }, [isLoading, isError]);

  return state;
};

export const handleError = (error: any): string => {
  console.error('Error in operation:', error);
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}; 