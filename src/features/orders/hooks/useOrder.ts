import { useQuery } from "@tanstack/react-query";
import { OrderService } from "../services/orderService";
import { useStore } from "@/hooks/useStore";
import { useCustomer } from "@/hooks/useCustomer";

export const useOrder = (id: string) => {
  const { storeName } = useStore();
  const { customer, loading: customerLoading } = useCustomer();
  const {
    data: order,
    isLoading: loading,
    isFetching,
    error: queryError,
  } = useQuery({
    queryKey: ["order", id, { customerId: customer?.id }],
    queryFn: () => OrderService.getOrder(storeName, id, customer?.id),
    enabled: !!id && !!storeName && !customerLoading, // Only run query when we have id, storeName and customer data is loaded
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch order") : null;

  return {
    order,
    loading: loading || customerLoading,
    isFetching,
    error,
  };
}; 