import { useTranslate } from "@refinedev/core";
import { motion, AnimatePresence } from "framer-motion";
import { Package2 } from "lucide-react";
import { OrderCard } from "./OrderCard";
import OrdersSkeleton from "./OrdersSkeleton";
import NoItemsComp from "../ui/no-items";

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
      <NoItemsComp
        icon={Package2}
        text={
          searchQuery
            ? "No orders found matching your search"
            : "No orders found"
        }
      />
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
