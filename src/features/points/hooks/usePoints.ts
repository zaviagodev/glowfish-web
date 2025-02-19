import { useQuery } from "@tanstack/react-query";
import { getCustomerPoints, type CustomerPoints } from "../services/pointsService";
import { useCustomer } from "@/hooks/useCustomer";
import { useState } from "react";

export const usePoints = (initialPage = 1, initialPageSize = 10) => {
  const { customer } = useCustomer();
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [type, setType] = useState<"earn" | "redeem" | "all">("all");

  const {
    data: points,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["points", customer?.id, { page, pageSize, type }],
    queryFn: () =>
      getCustomerPoints({
        customerId: customer?.id || "",
        page,
        pageSize,
        type,
      }),
    enabled: !!customer?.id,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
    keepPreviousData: true, // Keep showing previous data while fetching new page
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch points") : null;

  return {
    points,
    loading,
    error,
    page,
    setPage,
    type,
    setType,
    refetch,
    totalPages: points ? Math.ceil(points.total_count / pageSize) : 0,
  };
}; 