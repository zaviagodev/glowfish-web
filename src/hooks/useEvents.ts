// src/hooks/useEvents.ts
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventService, type PaginatedEvents } from '@/services/eventService';
import { Event } from '@/type/type';
import { useStore } from '@/hooks/useStore';
import { useCustomer } from '@/hooks/useCustomer';

// Cache key for localStorage
const EVENTS_CACHE_KEY = 'cached_events';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

interface UseEventsOptions {
  page?: number;
  pageSize?: number;
  orderId?: string;
}

export const useEvents = (options: UseEventsOptions = {}) => {
  const { page = 1, pageSize = 10, orderId } = options;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { storeName } = useStore();
  const { customer } = useCustomer();

  // Use React Query for data fetching and caching
  const { 
    data: eventData, 
    isLoading: eventsLoading, 
    isError: eventsError,
    refetch: refetchData
  } = useQuery({
    queryKey: orderId ? ['event', orderId] as const : ['events', storeName, customer?.id, page, pageSize] as const,
    queryFn: () => orderId 
      ? EventService.getEventByOrderId(orderId)
      : EventService.getEventsByCustomerId(customer?.id || '', storeName, page, pageSize),
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    enabled: orderId ? true : !!customer?.id,
    onError: (err: any) => {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    }
  });

  // Update loading state based on React Query
  useEffect(() => {
    setLoading(eventsLoading);
  }, [eventsLoading]);

  // Update error state based on React Query
  useEffect(() => {
    if (eventsError) {
      setError('Failed to fetch events');
    } else {
      setError(null);
    }
  }, [eventsError]);

  // Function to force refresh the data
  const refreshEvents = async () => {
    setLoading(true);
    try {
      await refetchData();
    } catch (err) {
      console.error('Error refreshing events:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh events');
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return {
      event: eventData,
      loading,
      error,
      refreshEvents,
      isLoading: eventsLoading,
      isError: eventsError
    };
  }

  const paginatedEvents = eventData as PaginatedEvents;
  return { 
    events: paginatedEvents?.data || [], 
    total: paginatedEvents?.total || 0,
    page: paginatedEvents?.page || page,
    pageSize: paginatedEvents?.pageSize || pageSize,
    loading, 
    error, 
    refreshEvents,
    isLoading: eventsLoading,
    isError: eventsError
  };
};

export type { Event, PaginatedEvents };

