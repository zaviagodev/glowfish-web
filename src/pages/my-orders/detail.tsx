import { useTranslate } from "@refinedev/core";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package2, Truck } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";

// Helper function to format dates
const formatDate = (date: Date | string | null) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString();
};

export default function OrderDetailPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { order, loading, error } = useOrder(id || '');
  const page = location.state?.page || "1";

  const handleBack = () => {
    navigate(`/my-orders?page=${page}`);
  };

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader title={t("Order Details")} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <PageHeader title={t("Order Details")} />
        <div className="p-4 text-center text-destructive">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-background">
        <PageHeader title={t("Order Details")} />
        <div className="p-4 text-center text-muted-foreground">
          {t("Order not found")}
        </div>
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
      isActive: order.status === "pending" || order.status === "unpaid",
      isPending: false,
    },
    {
      status: "Processing",
      date: order.status === "processing" ? formatDate(new Date()) : "",
      description: "Your order is processed and payment completed",
      icon: Package2,
      isActive: order.status === "processing",
      isPending: !["processing", "shipped", "delivered", "completed"].includes(
        order.status
      ),
    },
    {
      status: "Completed",
      date: order.status === "shipped" ? formatDate(new Date()) : "",
      description: "Your order has been completed",
      icon: Truck,
      isActive:
        order.status === "shipped" ||
        order.status === "delivered" ||
        order.status === "completed",
      isPending: !["shipped", "delivered", "completed"].includes(order.status),
    },
  ] as const;

  const isPendingAndNoAmount =
    order.status === "pending" && order.total_amount > 0;

  return (
    <div className="bg-background">
      <PageHeader title={t("Order Details")} onBack={handleBack} />

      <div className={cn("pt-14", { "pb-10": isPendingAndNoAmount })}>
        {/* Order Status Header */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-base font-medium text-card-foreground">
              {t("Order")} #
              {order.id && order.id.includes("-")
                ? order.id.split("-")[0]
                : order.id?.substring(0, 8) || ""}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(order.created_at)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground capitalize">
            {t("Status")}: {order.status}
          </div>
        </div>

        {/* Timeline */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
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
                    ? "before:bg-gradient-to-b before:from-primary before:to-muted"
                    : "before:bg-primary",
                  "last:before:hidden"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "absolute left-0 w-[30px] h-[30px] rounded-full flex items-center justify-center",
                    "shadow-sm border border-border",
                    "transition-all duration-300",
                    event.isPending
                      ? "bg-muted/50 scale-90 opacity-50"
                      : event.isActive
                      ? "bg-primary/20 scale-110 ring-4 ring-primary/20"
                      : "bg-primary/20"
                  )}
                >
                  <event.icon
                    className={cn(
                      "w-4 h-4 stroke-[1.5]",
                      event.isPending
                        ? "text-muted-foreground"
                        : "text-primary",
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
                          : "text-card-foreground"
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
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Customer Information")}
          </h2>
          <div className="bg-darkgray rounded-lg p-5">
            <div className="space-y-2">
              {(order.customer.first_name || order.customer.last_name) && (
                <h3 className="text-base font-medium text-card-foreground">
                  {[order.customer.first_name, order.customer.last_name]
                    .filter(Boolean)
                    .join(" ")}
                </h3>
              )}
              {order.customer.email && (
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-5 space-y-5">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Order Items")}
          </h2>
          <div className="space-y-6 bg-darkgray p-5 rounded-lg">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-5">
                {item.product_variants.product.image ? (
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product_variants.product.image}
                      alt={item.product_variants.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/20"></div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-2 text-card-foreground">
                    {item.product_variants.product.name}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {item.product_variants.options?.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <span className="font-medium">{option.name}:</span>
                        <span className="ml-1">{option.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        x{item.quantity}
                      </div>
                      <div className="text-sm font-medium text-card-foreground">
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
        <div className="p-5 space-y-5">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            {t("Order Summary")}
          </h2>

          <div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("Subtotal")}</span>
                <span className="text-card-foreground">
                  ฿{(order.subtotal || 0).toLocaleString()}
                </span>
              </div>
              {(order.tax ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Tax")}</span>
                  <span className="text-card-foreground">
                    ฿{(order.tax || 0).toLocaleString()}
                  </span>
                </div>
              )}
              {(order.shipping ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Shipping")}</span>
                  <span className="text-card-foreground">
                    ฿{(order.shipping || 0).toLocaleString()}
                  </span>
                </div>
              )}
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Discount")}</span>
                  <span className="text-green-600">
                    -฿{(order.discount || 0).toLocaleString()}
                  </span>
                </div>
              )}
              {(order.points_discount ?? 0) > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("Points Discount")}
                    </span>
                    <span className="text-green-600">
                      -฿{(order.points_discount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("Loyalty Points Used")}
                    </span>
                    <span className="text-muted-foreground">
                      {(order.loyalty_points_used || 0).toLocaleString()}{" "}
                      {t("points")}
                    </span>
                  </div>
                </>
              )}
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-card-foreground">
                      {t("Total")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({order.order_items.length} {t("items")})
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    ฿{(order.total_amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {isPendingAndNoAmount && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-background/80 backdrop-blur-xl border-t border-border p-5">
          <div className="space-y-3">
            <Button
              variant="default"
              size="lg"
              className="w-full main-btn"
              onClick={() => navigate(`/checkout/payment/${order.id}`)}
            >
              {t("Pay Now")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
