import { useQuery } from "@tanstack/react-query";
import { getRewards, getRewardById, type Reward } from "../services/rewardService";

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