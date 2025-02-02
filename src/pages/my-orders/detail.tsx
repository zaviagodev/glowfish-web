import { useTranslate } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package2, Truck, CheckCircle2, MessageCircle } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";

// Mock order data - replace with actual data fetching
const mockOrder = {
  id: "2",
  status: "shipping",
  date: "2024-01-19T15:45:00",
  created_at: "2024-01-19T15:45:00",
  tracking: {
    number: "TH1234567890",
    status: "Out for Delivery",
    location: "Bangkok, Thailand",
    lastUpdate: "2 hours ago",
  },
  order_items: [
    {
      id: "2",
      product: {
        name: "Jameson Live Music Event Ticket",
        image: "https://picsum.photos/201",
        description: "Test Event Ticket",
      },
      unit_price: 1500,
      quantity: 1,
    },
  ],
  total: 7300,
  shipping: {
    name: "John Doe",
    phone: "(+66) 123-456-789",
    address: "123 Sample Street",
    city: "Bangkok",
    state: "Bangkok",
    postalCode: "10110",
    country: "Thailand",
  },
  timeline: [
    {
      status: "Order Placed",
      date: "Jan 19, 2024 15:45",
      description: "Your order has been confirmed",
      icon: Package2,
      color: "#4CAF50",
    },
    {
      status: "Processing",
      date: "Jan 19, 2024 16:30",
      description: "Your order is being processed",
      icon: Package2,
      color: "#FF9800",
    },
    {
      status: "Shipped",
      date: "Jan 20, 2024 09:15",
      description: "Your order has been shipped",
      icon: Truck,
      color: "#2196F3",
    },
    {
      status: "Out for Delivery",
      date: "Jan 20, 2024 14:30",
      description: "Your order is out for delivery",
      icon: Truck,
      color: "#2196F3",
      isActive: true,
    },
    {
      status: "Delivered",
      date: "",
      description: "Pending delivery confirmation",
      icon: CheckCircle2,
      color: "#9E9E9E",
      isPending: true,
    },
  ],
};

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

  // In a real app, fetch order data based on id
  const order = mockOrder;
  // const order = orders?.find((order) => order.id === id);

  if (!order) {
    return (
      <div className="min-h-dvh bg-background p-6">
        <h1 className="text-xl font-semibold">{t("Order not found")}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title={t("Order Details")} />

      <div className="pt-14 pb-20">
        {/* Order Status Header */}
        <div className="px-4 py-3 border-b bg-background">
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

        {/* Tracking Card */}
        {order.tracking && (
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-darkgray",
                "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.02)]"
              )}
            >
              {/* Content */}
              <div className="relative p-4 space-y-4">
                {/* Tracking number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        order.status === "completed"
                          ? "bg-[#34C759]/10"
                          : "bg-[#007AFF]/10"
                      )}
                    >
                      <Package2
                        className={cn(
                          "w-4 h-4",
                          order.status === "completed"
                            ? "text-[#34C759]"
                            : "text-[#007AFF]"
                        )}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-medium">
                        {t("Tracking Number")}
                      </div>
                      <div
                        className={cn(
                          "text-sm font-medium"
                          // order.status === "completed"
                          //   ? "text-[#34C759]"
                          //   : "text-[#007AFF]"
                        )}
                      >
                        {order.tracking.number}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 text-xs transition-colors",
                      order.status === "completed"
                        ? "text-[#34C759]"
                        : "text-[#007AFF]"
                    )}
                    onClick={() => {
                      navigator.clipboard.writeText(order.tracking.number);
                    }}
                  >
                    {t("Copy")}
                  </Button>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      order.status === "completed"
                        ? "bg-[#34C759]/10"
                        : "bg-[#007AFF]/10"
                    )}
                  >
                    <Truck
                      className={cn(
                        "w-4 h-4",
                        order.status === "completed"
                          ? "text-[#34C759]"
                          : "text-[#007AFF]"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {t(order.tracking.status)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] mt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>{order.tracking.location}</span>
                        <span className="w-1 h-1 rounded-full bg-[#8E8E93]" />
                        <span>{order.tracking.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="h-1 bg-[#E5E5EA] rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      order.status === "completed"
                        ? "bg-[#34C759]"
                        : "bg-[#007AFF]"
                    )}
                    initial={{ width: "0%" }}
                    animate={{
                      width: order.status === "completed" ? "100%" : "75%",
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Timeline */}
        <div className="p-4 space-y-4 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Order Timeline")}
          </h2>
          <div className="relative">
            {order.timeline.map((event, index) => (
              <motion.div
                key={event.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative pl-12 pb-8 last:pb-0",
                  "before:absolute before:left-[15px] before:top-8 before:h-[calc(100%_-_30px)]",
                  "before:w-[2px] before:m-[-1px]",
                  event.isActive || event.isPending
                    ? "before:bg-gradient-to-b before:from-[#007AFF] before:to-background"
                    : "before:bg-[#34C759]",
                  "last:before:hidden"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "absolute left-0 w-[30px] h-[30px] rounded-full flex items-center justify-center",
                    "shadow-sm",
                    "transition-all duration-300",
                    event.isPending
                      ? "bg-background opacity-50"
                      : event.isActive
                      ? "bg-[#007AFF]/10"
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
                      <span className="text-[13px] text-muted-foreground">
                        {event.date}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] leading-[1.3] text-muted-foreground">
                    {t(event.description)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-4 space-y-4 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Customer Information")}
          </h2>
          <div className="bg-darkgray rounded-lg p-5">
            <div className="space-y-2">
              <h3 className="text-base font-medium">
                {/* {order.customer.first_name + " " + order.customer.last_name} */}
                John Doe
              </h3>
              <p className="text-sm text-muted-foreground">
                {/* {order.customer.email} */}
                john@mail.com
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-4 space-y-5">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Order Items")}
          </h2>
          <div className="space-y-6 bg-darkgray p-5 rounded-lg">
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

        {/* Order Summary */}
        <div className="p-4 space-y-5 bg-background">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Order Summary")}
          </h2>
          <div className="rounded-lg">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("Total")}
                </span>
                <span className="text-sm font-bold">
                  {/* ฿{order.total_amount.toLocaleString()} */}
                  ฿200
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t px-6 py-5">
        <Button
          className="w-full main-btn flex items-center gap-2"
          onClick={() => {
            /* Add help functionality */
          }}
        >
          <MessageCircle className="w-4 h-4" />
          {t("Need Help?")}
        </Button>
      </div>
    </div>
  );
}
