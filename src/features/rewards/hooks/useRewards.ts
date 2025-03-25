import { useQuery } from "@tanstack/react-query";
import { getRewards, getRewardById, getRewardOrders, getRewardOrderById, type Reward, type RewardOrder } from "../services/rewardService";
import { useStore } from "@/hooks/useStore";



export const useRewards = () => {
  const { storeName } = useStore();
  const {
    data: rewards = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["rewards", storeName],
    queryFn: () => getRewards(storeName),
    enabled: !!storeName, // Only fetch when storeName is available
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch rewards") : null;

  return {
    rewards,
    loading,
    error,
  };
};

export const useReward = (id: string) => {
  const { storeName } = useStore();
  const {
    data: reward,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["reward", id, storeName],
    queryFn: () => getRewardById(id, storeName),
    enabled: !!id && !!storeName, // Only fetch when id and storeName are available
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch reward") : null;

  return {
    reward,
    loading,
    error,
  };
};

export const useRewardOrders = () => {
  const { storeName } = useStore(); 
  const {
    data: orders = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["reward-orders", storeName],
    queryFn: () => getRewardOrders(storeName),
    enabled: !!storeName, // Only fetch when storeName is available
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch reward orders") : null;

  return {
    orders,
    loading,
    error,
  };
};

export const useRewardOrder = (id: string) => {
  const { storeName } = useStore();
  const {
    data: order,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["reward-order", id, storeName],
    queryFn: () => getRewardOrderById(id, storeName),
    enabled: !!id && !!storeName, // Only fetch when id and storeName are available
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch reward order") : null;

  return {
    order,
    loading,
    error,
  };
}; 