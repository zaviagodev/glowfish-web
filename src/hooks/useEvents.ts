// src/hooks/useEvents.ts
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventService, type Event } from '@/services/eventService';

// Cache key for localStorage
const EVENTS_CACHE_KEY = 'cached_events';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useEvents = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for data fetching and caching
  const { 
    data: events = [], 
    isLoading: eventsLoading, 
    isError: eventsError,
    refetch: refetchData
  } = useQuery({
    queryKey: ['events'],
    queryFn: EventService.getEvents,
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
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

  return { 
    events, 
    loading, 
    error, 
    refreshEvents,
    isLoading: eventsLoading,
    isError: eventsError
  };
};

export type { Event };
