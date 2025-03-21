import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/hooks/useConfig";
import { RewardOrder } from "../services/rewardService";
import { Package2, Calendar, Gift, Tag } from "lucide-react";

interface MyRewardProps {
  order: RewardOrder;
}

export function MyReward({ order }: MyRewardProps) {
  const navigate = useNavigate();
  const { config } = useConfig();
  
  // Get the first reward item from the order
  const rewardItem = order.order_items.find(item => item.meta_data.reward);
  const product = rewardItem?.product_variant.product;
  const image = product?.images[0];

  return (
    <motion.div
      onClick={() => navigate(`/my-rewards/${order.id}`)}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all bg-card cursor-pointer",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.04)]"
      )}
      whileHover={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Content */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 h-auto md:h-[140px]">
        {/* Image Section */}
        <div className="h-48 md:h-full bg-muted/50 flex items-center justify-center relative overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product?.name || "Reward"}
              className="w-full h-full object-cover"
            />
          ) : config?.storeLogo ? (
            <img src={config.storeLogo} alt="Store Logo" className="w-20 h-20 object-contain" />
          ) : (
            <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package2 className="w-10 h-10 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Order Details */}
        <div className="p-6 col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {product?.name || `Order #${order.id.slice(0, 8)}`}
              </h3>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                order.status === 'completed' && "bg-green-100 text-green-800",
                order.status === 'processing' && "bg-yellow-100 text-yellow-800",
                order.status === 'cancelled' && "bg-red-100 text-red-800",
                order.status === 'pending' && "bg-gray-100 text-gray-800"
              )}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4" />
                <span>{order.loyalty_points_used} points</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              {order.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>{order.tags.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Order Items:</span>
                  <span className="font-medium">{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
