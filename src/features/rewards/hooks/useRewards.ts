import { useQuery } from "@tanstack/react-query";
import { getRewards, getRewardById, getRewardOrders, getRewardOrderById, type Reward, type RewardOrder } from "../services/rewardService";

export const useRewards = () => {
  const {
    data: rewards = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["rewards"],
    queryFn: getRewards,
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch rewards") : null;

  return {
    rewards,
    loading,
    error,
  };
};

export const useReward = (id: string) => {
  const {
    data: reward,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["reward", id],
    queryFn: () => getRewardById(id),
    enabled: !!id, // Only fetch when id is available
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch reward") : null;

  return {
    reward,
    loading,
    error,
  };
};

export const useRewardOrders = () => {
  const {
    data: orders = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["reward-orders"],
    queryFn: getRewardOrders,
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch reward orders") : null;

  return {
    orders,
    loading,
    error,
  };
};

export const useRewardOrder = (id: string) => {
  const {
    data: order,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["reward-order", id],
    queryFn: () => getRewardOrderById(id),
    enabled: !!id, // Only fetch when id is available
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch reward order") : null;

  return {
    order,
    loading,
    error,
  };
}; 