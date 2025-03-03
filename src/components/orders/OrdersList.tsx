import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { Package2 } from "lucide-react";
import { OrderCard } from "./OrderCard";
import OrdersSkeleton from "./OrdersSkeleton";

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
    return <OrdersSkeleton />;
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
