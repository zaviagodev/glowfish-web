import { useQuery, useMutation, useQueryClient, QueryObserverResult } from '@tanstack/react-query';
import { ticketService, CustomerEvent } from '../services/ticketService';
import { useCustomer } from '@/hooks/useCustomer';
import { CACHE_EXPIRY_TIME } from '@/features/home/utils/hookUtils';

interface UseTicketsResult {
  tickets: CustomerEvent[];
  loading: boolean;
  error: Error | null;
  refreshTickets: () => Promise<QueryObserverResult<CustomerEvent[], unknown>>;
  updateTicketStatus: (id: string, status: 'used' | 'unused') => Promise<void>;
  checkTicketStatus: (id: string) => Promise<string>;
  isLoading: boolean;
  isError: boolean;
}

export const useTickets = (): UseTicketsResult => {
  const { customer } = useCustomer();
  const queryClient = useQueryClient();

  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['tickets', customer?.id],
    queryFn: async () => {
      return await ticketService.getTickets(customer.id);
    },
    staleTime: CACHE_EXPIRY_TIME,
    cacheTime: CACHE_EXPIRY_TIME * 2,
    retry: 2,
    enabled: !!customer?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'used' | 'unused' }) => {
      await ticketService.updateTicketStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets', customer?.id]);
    },
  });

  const updateTicketStatus = async (id: string, status: 'used' | 'unused') => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const checkTicketStatus = async (id: string) => {
    return await ticketService.checkTicketStatus(id);
  };

  return {
    tickets,
    loading: isLoading,
    error: error as Error | null,
    refreshTickets: refetch,
    updateTicketStatus,
    checkTicketStatus,
    isLoading,
    isError
  };
}; 