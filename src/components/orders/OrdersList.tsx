import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { Package2 } from "lucide-react";
import { OrderCard } from "./OrderCard";

interface OrdersListProps {
  orders: any[];
  searchQuery: string;
  isLoading?: boolean;
}

export function OrdersList({
  orders,
  searchQuery,
  isLoading,
}: OrdersListProps) {
  const t = useTranslate();

  if (isLoading) {
    return (
      <div className="space-y-4 px-5">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-darkgray/50 rounded-lg overflow-hidden animate-pulse"
          >
            {/* Order Header Skeleton */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="h-4 w-24 bg-darkgray rounded"></div>
                  <div className="h-3 w-32 bg-darkgray rounded mt-2"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-darkgray rounded-full"></div>
            </div>

            {/* Order Items Skeleton */}
            <div className="p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-darkgray flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-darkgray rounded"></div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-darkgray rounded"></div>
                    <div className="h-4 w-20 bg-darkgray rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Footer Skeleton */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-darkgray rounded"></div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="h-3 w-12 bg-darkgray rounded mb-1"></div>
                    <div className="h-4 w-16 bg-darkgray rounded"></div>
                  </div>
                  <div className="h-5 w-5 bg-darkgray rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center py-12 px-4"
      >
        <Package2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-center">
          {searchQuery
            ? t("No orders found matching your search")
            : t("No orders found")}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4 px-5"
    >
      {orders.map((order, index) => (
        <OrderCard key={order.id} order={order} index={index} />
      ))}
    </motion.div>
  );
}
