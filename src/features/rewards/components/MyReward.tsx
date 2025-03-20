import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/hooks/useConfig";
import { Reward } from "../services/rewardService";

interface MyRewardProps {
  reward: Reward;
}

export function MyReward({ reward }: MyRewardProps) {
  const navigate = useNavigate();
  const { config } = useConfig();
  return (
    <motion.div
      onClick={() => navigate(`/rewards/${reward.id}`)}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all bg-darkgray",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]"
      )}
      whileHover={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Content */}
      <div className="relative grid grid-cols-3 h-[120px]">
        {/* Image Section */}
        {reward.product_images && reward.product_images.length > 0 ? (
          <img
            src={reward.product_images[0].url}
            alt={reward.name}
            className="w-full h-full object-cover aspect-square object-top"
          />
        ) : (
          <div className="h-full bg-black flex items-center justify-center">
            {config?.storeLogo ? (
              <img src={config.storeLogo} alt="Store Logo" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-lg" />
            )}
          </div>
        )}

        {/* Event Details */}
        <div className="p-4 col-span-2">
          <h3 className="font-medium mb-2 whitespace-pre overflow-hidden text-ellipsis">
            {reward.name}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
