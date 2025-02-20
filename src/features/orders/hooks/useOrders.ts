import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "../services/orderService";
import { useStore } from "@/hooks/useStore";
import { useCustomer } from "@/hooks/useCustomer";

export const useOrders = (
  page: number = 1,
  pageSize: number = 10,
  status?: string,
  search?: string
) => {
  const { storeName } = useStore();
  const { customer, loading: customerLoading } = useCustomer();
  const queryClient = useQueryClient();

  const queryKey = ["orders", { page, pageSize, status, search, customerId: customer?.id }];

  const {
    data,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => OrderService.getOrders(storeName, page, pageSize, customer?.id, status),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    enabled: !!storeName && !customerLoading // Only run query when we have storeName and customer data is loaded
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch orders") : null;

  const refreshOrders = async () => {
    // Invalidate all orders queries
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    // Force refetch the current query
    return await queryClient.refetchQueries({ queryKey });
  };

  return {
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    totalPages: Math.ceil((data?.total ?? 0) / pageSize),
    loading: loading || customerLoading,
    isFetching,
    error,
    hasNextPage: page < Math.ceil((data?.total ?? 0) / pageSize),
    hasPreviousPage: page > 1,
    refreshOrders,
  };
}; 