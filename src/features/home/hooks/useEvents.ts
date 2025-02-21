// src/hooks/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { EventService } from '@/features/home/services/eventService';
import { Event, EventQueryOptions, EventQueryResult, PaginatedEvents } from '../types/event.types';
import { useStore } from '@/hooks/useStore';
import { useCustomer } from '@/hooks/useCustomer';
import { CACHE_EXPIRY_TIME, useQueryState, handleError } from '../utils/hookUtils';
import { transformEvent, transformPaginatedEvents } from '../transformers/eventTransformer';

export const useEvents = (options: EventQueryOptions = {}): EventQueryResult => {
  const { page = 1, pageSize = 10, orderId } = options;
  const { storeName } = useStore();
  const { customer } = useCustomer();

  const { 
    data: eventData, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: orderId ? ['event', orderId] : ['events', storeName, customer?.id, page, pageSize],
    queryFn: async () => {
      const data = orderId 
        ? await EventService.getEventByOrderId(orderId)
        : await EventService.getEventsByCustomerId(customer?.id || '', storeName, page, pageSize);
      return orderId ? transformEvent(data) : transformPaginatedEvents(data);
    },
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    enabled: orderId ? true : !!customer?.id,
  });

  const { loading, error } = useQueryState(isLoading, isError);

  const refreshEvents = async () => {
    try {
      await refetch();
    } catch (err) {
      handleError(err);
    }
  };

  if (orderId) {
    return {
      event: eventData as Event,
      loading,
      error,
      refreshEvents,
      isLoading,
      isError
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
    isLoading,
    isError
  };
};

export type { Event, PaginatedEvents };

