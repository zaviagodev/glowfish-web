import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { RewardOrder } from "../services/rewardService";
import { Calendar, Gift, Tag, Image } from "lucide-react";

interface MyRewardProps {
  order: RewardOrder;
}

export function MyReward({ order }: MyRewardProps) {
  const navigate = useNavigate();

  // Get the first reward item from the order
  const rewardItem = order.order_items.find((item) => item.meta_data.reward);
  const product = rewardItem?.product_variant.product;
  const image = product?.images[0];
  const orderStatusColors = {
    completed: "bg-icon-green-background text-icon-green-foreground",
    processing: "bg-icon-blue-background text-icon-blue-foreground",
    cancelled: "bg-icon-red-background text-icon-red-foreground",
    pending: "bg-icon-orange-background text-icon-orange-foreground",
  };

  return (
    <motion.div
      onClick={() => navigate(`/my-rewards/${order.id}`)}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all bg-darkgray cursor-pointer",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.04)]"
      )}
      whileHover={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Content */}
      <div className="relative grid grid-cols-3 h-auto">
        {/* Image Section */}
        <div className="h-full bg-black flex items-center justify-center relative overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product?.name || "Reward"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-darkgray w-full">
              <Image className="w-16 h-16 text-[#767676]" />
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="p-4 col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {product?.name || `Order #${order.id.slice(0, 8)}`}
                </h3>
                <p className="text-muted-foreground">{`Order #${order.id.slice(
                  0,
                  8
                )}`}</p>
              </div>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  orderStatusColors[order.status]
                )}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
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
          {/* <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Order Items:</span>
                <span className="font-medium">
                  {order.order_items.length} item
                  {order.order_items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </motion.div>
  );
}
