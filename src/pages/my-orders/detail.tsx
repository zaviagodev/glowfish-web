import { useTranslate } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package2, Truck, CheckCircle2, MessageCircle } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";

// Helper function to format dates
const formatDate = (date: Date | string | null) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString();
};

export default function OrderDetailPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders } = useOrders();

  const order = orders?.find((order) => order.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-6">
        <h1 className="text-xl font-semibold">{t("Order not found")}</h1>
      </div>
    );
  }

  // Map status to timeline
  const timeline = [
    {
      status: "Order Placed",
      date: formatDate(order.created_at),
      description: "Your order has been confirmed",
      icon: Package2,
      color: "#4CAF50",
      isActive: order.status === "pending",
      isPending: 0,
    },
    {
      status: "Processing",
      date: order.status === "processing" ? formatDate(new Date()) : "",
      description: "Your order is processed and Payment Completed",
      icon: Package2,
      color: "#FF9800",
      isActive: order.status === "processing",
      isPending: !["processing", "shipped"].includes(order.status),
    },
    {
      status: "Completed and Shipped",
      date: order.status === "shipped" ? formatDate(new Date()) : "",
      description: "Your order has been Completed and Shipped",
      icon: Truck,
      color: "#2196F3",
      isActive: order.status === "shipped",
      isPending: !["shipped"].includes(order.status),
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("Order Details")} />

      <div className="pt-14 pb-32">
        {/* Order Status Header */}
        <div className="px-6 py-5 border-b bg-background">
          <div className="flex items-center justify-between mb-2">
            <div className="text-base font-medium">
              {t("Order")} #{order.id}
            </div>
            <div className="text-sm text-[#8E8E93]">
              {formatDate(order.created_at)}
            </div>
          </div>
          <div className="text-sm text-[#8E8E93] capitalize">
            {t("Status")}: {order.status}
          </div>
        </div>

        {/* Spacer */}
        <div className="h-2 bg-[#F5F5F5]" />

        {/* Timeline */}
        <div className="p-6 space-y-4 bg-background">
          <h2 className="text-sm font-medium text-[#8E8E93] uppercase tracking-wide">
            {t("Order Timeline")}
          </h2>
          <div className="relative">
            {timeline.map((event, index) => (
              <motion.div
                key={event.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative pl-12 pb-8 last:pb-0",
                  "before:absolute before:left-[15px] before:top-8 before:h-[calc(100%-24px)]",
                  "before:w-[2px]",
                  event.isActive || event.isPending
                    ? "before:bg-gradient-to-b before:from-[#007AFF] before:to-[#E5E5EA]"
                    : "before:bg-[#34C759]",
                  "last:before:hidden"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "absolute left-0 w-[30px] h-[30px] rounded-full flex items-center justify-center",
                    "shadow-sm border border-[#E5E5EA]",
                    "transition-all duration-300",
                    event.isPending
                      ? "bg-background scale-90 opacity-50"
                      : event.isActive
                      ? "bg-[#007AFF]/10 scale-110 ring-4 ring-[#007AFF]/10"
                      : "bg-[#34C759]/10"
                  )}
                  style={{
                    color: event.isPending
                      ? "#8E8E93"
                      : event.isActive
                      ? "#007AFF"
                      : "#34C759",
                  }}
                >
                  <event.icon
                    className={cn(
                      "w-4 h-4 stroke-[1.5]",
                      event.isActive && "animate-pulse"
                    )}
                  />
                </div>

                {/* Content */}
                <div
                  className={cn("relative", event.isActive && "animate-pulse")}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3
                      className={cn(
                        "text-[15px] font-semibold leading-none tracking-tight",
                        event.isPending
                          ? "text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {t(event.status)}
                    </h3>
                    {event.date && (
                      <span className="text-[13px] text-[#8E8E93]">
                        {event.date}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] leading-[1.3] text-[#8E8E93]">
                    {t(event.description)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="h-2 bg-[#F5F5F5]" />

        {/* Customer Information */}
        <div className="p-6 space-y-4 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t("Customer Information")}
          </h2>
          <div className="bg-background rounded-lg p-5">
            <div className="space-y-2">
              <h3 className="text-base font-medium">
                {order.customer.first_name + " " + order.customer.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {order.customer.email}
              </p>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-2 bg-[#F5F5F5]" />

        {/* Order Items */}
        <div className="p-6 space-y-5 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t("Order Items")}
          </h2>
          <div className="space-y-6">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-5">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {item.product.name}
                  </h3>
                  {item.product.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.product.description}
                    </p>
                  )}
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
          </div>
        </div>

        {/* Spacer */}
        <div className="h-2 bg-[#F5F5F5]" />

        {/* Order Summary */}
        <div className="p-6 space-y-5 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t("Order Summary")}
          </h2>
          <div className="bg-background rounded-lg p-5">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[15px] text-[#8E8E93]">{t("Total")}</span>
                <span className="text-[15px] font-bold">
                  ฿{order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t px-6 py-5">
        <Button
          className="w-full bg-black text-white hover:bg-black/90 h-12"
          onClick={() => {
            /* Add help functionality */
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("Need Help?")}
        </Button>
      </div>
    </div>
  );
}
