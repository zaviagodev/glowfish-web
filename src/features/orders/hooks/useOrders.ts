import { useQuery } from "@tanstack/react-query";
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
  const {
    data,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["orders", { page, pageSize, status, search, customerId: customer?.id }],
    queryFn: () => OrderService.getOrders(storeName, page, pageSize, customer?.id, status),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!storeName && !customerLoading // Only run query when we have storeName and customer data is loaded
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch orders") : null;

  return {
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    totalPages: Math.ceil((data?.total ?? 0) / pageSize),
    loading: loading || customerLoading,
    isFetching,
    error,
    hasNextPage: page < Math.ceil((data?.total ?? 0) / pageSize),
    hasPreviousPage: page > 1,
    refreshOrders: refetch,
  };
}; 