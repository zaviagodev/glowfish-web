import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    date: string;
    items: OrderItem[];
    total: number;
  };
  index: number;
}

export function OrderCard({ order, index }: OrderCardProps) {
  const t = useTranslate();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      onClick={() => navigate(`/my-orders/${order.id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg !bg-darkgray overflow-hidden hover:bg-background transition-colors duration-200 cursor-pointer"
    >
      {/* Order Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-medium">
              {t("Order")} #{order.id}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(order.date)}
            </div>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order Items */}
      {order.items.map((item) => (
        <div key={item.id} className="p-4 flex gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  x{item.quantity}
                </div>
                <div className="text-sm font-medium">
                  ฿{item.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Order Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {order.items.length} {t("items")}
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                {t("Total")}
              </div>
              <div className="text-sm font-medium">
                ฿{order.total.toLocaleString()}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
