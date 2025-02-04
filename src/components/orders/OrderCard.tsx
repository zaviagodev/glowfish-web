import { useTranslate } from "@refinedev/core";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  variant_id: string;
  product_variants: {
    name: string;
    options: {
      name: string;
      value: string;
    }[];
    product: {
      id: string;
      name: string;
      description: string;
      image: string;
    };
  };
}

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    created_at: string;
    order_items: OrderItem[];
    total_amount: number;
  };
  index: number;
}

export function OrderCard({ order, index }: OrderCardProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page") || "1";

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/my-orders/${order.id}`, {
      state: { from: "orders-list", page: currentPage },
    });
  };

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
      onClick={handleClick}
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
              {order.id && order.id.includes("-")
                ? `${t("Order")} #${order.id.split("-")[0]}`
                : `${t("Order")} #${order.id?.substring(0, 8) || ""}`}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(order.created_at)}
            </div>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order Items */}
      {order.order_items.map((item) => (
        <div key={item.id} className="p-4 flex gap-4">
          {item.product_variants.product.image ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={item.product_variants.product.image}
                alt={item.product_variants.product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/20"></div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-2">
              {item.product_variants.product.name}
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  x{item.quantity}
                </div>
                <div className="text-sm font-medium">
                  ฿{item.unit_price.toLocaleString()}
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
            {t("items", { count: order.order_items.length })}
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                {t("Total")}
              </div>
              <div className="text-sm font-medium">
                ฿{order.total_amount.toLocaleString()}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
