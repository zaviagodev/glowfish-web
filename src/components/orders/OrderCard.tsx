import { useTranslate } from "@refinedev/core";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "../ui/button";
import GlowfishIcon from "../icons/GlowfishIcon";
import { format } from "date-fns";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formattedDateAndTime } from "@/lib/utils";

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

const LIMITED_ORDERS: number = 1;

export function OrderCard({ order, index }: OrderCardProps) {
  const t = useTranslate();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page") || "1";
  const [showAllItems, setShowAllItems] = useState(false);
  const visibleItems = showAllItems
    ? order.order_items
    : order.order_items.slice(0, LIMITED_ORDERS);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/my-orders/${order.id}`, {
      state: { from: "orders-list", page: currentPage },
    });
  };

  const ChevronIcon = showAllItems ? (
    <ChevronUp className="h-4 w-4" />
  ) : (
    <ChevronDown className="h-4 w-4" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg !bg-darkgray overflow-hidden hover:bg-background transition-colors duration-200 cursor-pointer"
    >
      {/* Order Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <div className="font-medium">
              {order.id && order.id.includes("-")
                ? `${t("Order")} #${order.id.split("-")[0]}`
                : `${t("Order")} #${order.id?.substring(0, 8) || ""}`}
            </div>
            <div className="text-muted-foreground">
              {format(order.created_at, formattedDateAndTime)}
            </div>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order Items */}
      {visibleItems.map((item, index) => {
        return (
          <motion.div
            key={item.id}
            className="p-4 pb-0 flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              {item.product_variants.product.image ? (
                <img
                  src={item.product_variants.product.image}
                  alt={item.product_variants.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full aspect-square overflow-hidden bg-black">
                  <GlowfishIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium line-clamp-2">
                {item.product_variants.product.name}
              </h3>
              <div className="mt-1 space-y-2">
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
          </motion.div>
        );
      })}

      {order.order_items.length > LIMITED_ORDERS && (
        <button
          onClick={() => setShowAllItems(!showAllItems)}
          className="w-fit flex items-center gap-1 text-sm mx-auto text-muted-foreground mt-2"
        >
          <span>{showAllItems ? "Show less" : "Show more"}</span>
          {ChevronIcon}
        </button>
      )}

      {/* Order Footer */}
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{t("Items")}</div>
            <div className="text-sm font-semibold">
              {order.order_items.length}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{t("Total")}</div>
            <div className="text-lg font-semibold">
              ฿{order.total_amount.toLocaleString()}
            </div>
          </div>
          <Button onClick={handleClick} className="main-btn mt-2">
            Order details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
