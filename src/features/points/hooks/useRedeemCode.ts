import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface RedeemResponse {
  points_earned: number;
}

interface UseRedeemCodeOptions {
  onSuccess: (points: number) => void;
  onError: (error: Error) => void;
}

export const useRedeemCode = ({ onSuccess, onError }: UseRedeemCodeOptions) => {
  const [isRedeeming, setIsRedeeming] = useState(false);

  const redeemCode = async (code: string) => {
    try {
      setIsRedeeming(true);
      console.log("Attempting to redeem code:", code);

      const { data, error } = await supabase
        .rpc("redeem_campaign_code", {
          p_code: code,
        })
        .single();

      if (error) {
        console.error("Redemption error:", error);
        throw error;
      }

      console.log("Redemption response:", data);
      const response = data as RedeemResponse;
      onSuccess(response.points_earned);
    } catch (error: any) {
      console.error("Error in redeemCode:", error);
      onError(error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return {
    redeemCode,
    isRedeeming,
  };
}; 