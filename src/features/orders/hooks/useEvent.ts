import { useQuery } from '@tanstack/react-query';
import { EventService } from '@/features/home/services/eventService';
import type { Event } from '@/features/home/services/eventService';

export const useEvent = (orderId: string) => {
  const {
    data: event,
    isLoading,
    error,
    refetch
  } = useQuery<Event | null>({
    queryKey: ['event', orderId],
    queryFn: () => EventService.getEventByOrderId(orderId),
    enabled: !!orderId,
  });

  return {
    event,
    isLoading,
    error,
    refetch
  };
};

export default useEvent; 