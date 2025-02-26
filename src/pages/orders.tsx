import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import {
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { OrdersList } from "@/components/orders/OrdersList";
import { OrdersSearch } from "@/components/orders/OrdersSearch";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useOrder } from "@/features/orders/hooks/useOrder";
import { useEvent } from "@/features/orders/hooks/useEvent";
import { defaultOrderStatuses } from "@/components/settings/OrderStatusBar";
import LoadingSpin from "@/components/loading/LoadingSpin";
import Pagination from "@/components/pagination/Pagination";
import { Package2, Truck, Ticket } from "lucide-react";
import { cn, formattedDateAndTime } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { format } from "date-fns";

// Add LoadingOverlay component at the top of the file
const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.1 }}
    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <LoadingSpin />
  </motion.div>
);

const OrdersPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentStatus = searchParams.get("status") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 5;

  const {
    orders,
    loading: ordersLoading,
    isFetching: ordersFetching,
    error,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = useOrders(
    currentPage,
    ITEMS_PER_PAGE,
    currentStatus === "all" ? undefined : currentStatus,
    searchQuery
  );

  const {
    order,
    loading: orderLoading,
    isFetching: orderFetching,
    error: orderError,
  } = useOrder(id || "");

  const {
    event,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(id || "");

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("status", status);
    newParams.set("page", "1"); // Reset to first page when changing status
    setSearchParams(newParams);
  };

  const handleBack = () => {
    navigate(`/orders?page=${currentPage}`);
  };

  const handleViewTickets = () => {
    navigate(`/tickets/${id}`);
  };

  const handlePayNow = () => {
    navigate(`/payment/${id}`);
  };

  const formattedOrders =
    orders?.map((order) => ({
      id: order.id,
      status: order.status === "shipped" ? "completed" : order.status,
      created_at: order.created_at,
      order_items: order.order_items,
      total_amount: order.total_amount,
    })) || [];

  // Show loading overlay during initial load or data fetching
  const showLoading = id
    ? orderLoading || orderFetching
    : ordersLoading || (ordersFetching && currentStatus !== "all");

  // Early return for error states
  if (error || orderError) {
    return (
      <div className="bg-background">
        <PageHeader
          title={id ? t("Order Details") : t("Orders")}
          onBack={id ? handleBack : undefined}
        />
        <div className="p-4 text-center text-red-500">
          {error || orderError}
        </div>
      </div>
    );
  }

  // Early return for not found state
  if (id && !order && !orderLoading) {
    return (
      <div className="bg-background">
        <PageHeader title={t("Order Details")} onBack={handleBack} />
        <div className="p-4 text-center text-muted-foreground">
          {t("Order not found")}
        </div>
      </div>
    );
  }

  // Map status to timeline for order details
  const timeline =
    id && order
      ? [
          {
            status: "Order Placed",
            date: format(order.created_at, formattedDateAndTime),
            description: "Your order has been confirmed",
            icon: Package2,
            isActive: order.status === "pending" || order.status === "unpaid",
            isPending: false,
          },
          {
            status: "Processing",
            date:
              order.status === "processing"
                ? format(new Date(), formattedDateAndTime)
                : "",
            description: "Your order is processed and payment completed",
            icon: Package2,
            isActive: order.status === "processing",
            isPending: ![
              "processing",
              "shipped",
              "delivered",
              "completed",
            ].includes(order.status),
          },
          {
            status: "Completed",
            date:
              order.status === "shipped"
                ? format(new Date(), formattedDateAndTime)
                : "",
            description: "Your order has been completed",
            icon: Truck,
            isActive:
              order.status === "shipped" ||
              order.status === "delivered" ||
              order.status === "completed",
            isPending: !["shipped", "delivered", "completed"].includes(
              order.status
            ),
          },
        ]
      : [];

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoading && <LoadingOverlay />}
      </AnimatePresence>

      {id && order ? (
        <div className="bg-background">
          <PageHeader title={t("Order Details")} onBack={handleBack} />
          <div
            className={cn(
              "pt-14"
              // {"pb-10": order.status === "pending" && order.total_amount > 0}
            )}
          >
            {/* Order Status Header */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-base font-medium text-card-foreground">
                  {t("Order")} #
                  {order.id && order.id.includes("-")
                    ? order.id.split("-")[0]
                    : order.id?.substring(0, 8) || ""}
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="text-sm text-muted-foreground">
                {format(order.created_at, formattedDateAndTime)}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-5 space-y-4">
              <h2 className="text-sm font-medium tracking-wide">
                {t("Order Timeline")}
              </h2>
              <div className="relative bg-darkgray rounded-lg p-5">
                {timeline.map((event, index) => (
                  <motion.div
                    key={event.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative pl-12 pb-8 last:pb-0",
                      "before:absolute before:left-[14px] before:top-[30px] before:h-[calc(100%-32px)]",
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
                      className={cn(
                        "relative",
                        event.isActive && "animate-pulse"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h3
                          className={cn(
                            "text-[15px] font-semibold leading-none tracking-tight text-muted-foreground",
                            { "text-card-foreground": event.isActive }
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
              <h2 className="text-sm font-medium tracking-wide">
                {t("Customer Information")}
              </h2>
              <div className="bg-darkgray rounded-lg p-5">
                <div className="space-y-1">
                  {(order.customer.first_name || order.customer.last_name) && (
                    <h3 className="text-base font-medium text-card-foreground">
                      {[order.customer.first_name, order.customer.last_name]
                        .filter(Boolean)
                        .join(" ")}
                    </h3>
                  )}
                  {order.customer.email && (
                    <p className="text-sm text-muted-foreground text-ellipsis overflow-hidden">
                      {order.customer.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-5 space-y-5">
              <h2 className="text-sm font-medium tracking-wide">
                {t("Order Items")}
              </h2>
              <div className="space-y-6">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex gap-5">
                    {item.product_variants.product.image ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product_variants.product.image}
                          alt={item.product_variants.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-20 h-20 rounded-lg overflow-hidden bg-black">
                        <GlowfishIcon className="w-14 h-14" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-card-foreground mb-1 truncate">
                        {item.product_variants.product.name}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p>
                            {t("Unit Price")}: ฿
                            {item.unit_price.toLocaleString()}
                          </p>
                          <p className="whitespace-pre">
                            {t("Quantity")}: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-card-foreground">
                          {t("Total")}: ฿
                          {(item.unit_price * item.quantity).toLocaleString()}
                        </p>
                        {item.product_variants.options?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.product_variants.options.map(
                              (option, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                                >
                                  {option.name}: {option.value}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-5 space-y-4">
              <h2 className="text-sm font-medium tracking-wide">
                {t("Order Summary")}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("Subtotal")}</span>
                  <span className="text-card-foreground">
                    ฿{order.subtotal.toLocaleString()}
                  </span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("Shipping")}
                    </span>
                    <span className="text-card-foreground">
                      ฿{order.shipping.toLocaleString()}
                    </span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("Tax")}</span>
                    <span className="text-card-foreground">
                      ฿{order.tax.toLocaleString()}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("Discount")}</span>
                    <span>-฿{order.discount.toLocaleString()}</span>
                  </div>
                )}
                {order.points_discount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("Points Discount")}</span>
                    <span>-฿{order.points_discount.toLocaleString()}</span>
                  </div>
                )}
                {order.loyalty_points_used > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("Used Points")}</span>
                    <span>{order.loyalty_points_used.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Total")}</span>
                    <span className="font-medium">
                      ฿{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Now Button */}
            {order.status === "pending" && order.total_amount > 0 && (
              <div className="px-5">
                <button onClick={handlePayNow} className="w-full main-btn">
                  {t("Pay Now")} (฿{order.total_amount.toLocaleString()})
                </button>
              </div>
            )}

            {/* View Tickets Button */}
            {!eventLoading && event && event.tickets.length > 0 && (
              <div className="px-5">
                <button onClick={handleViewTickets} className="w-full main-btn">
                  <Ticket className="w-4 h-4 mr-2" />
                  {t("View Tickets")} ({event.tickets.length})
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-background">
          <PageHeader
            title={t("Orders")}
            onBack={() => navigate("/settings")}
          />
          <div className="pt-14 pb-4">
            <OrdersSearch value={searchQuery} onChange={setSearchQuery} />

            <Tabs value={currentStatus} onValueChange={handleStatusChange}>
              <div className="px-4 overflow-auto">
                <TabsList className="w-full h-auto p-1 bg-tertiary min-w-fit gap-1">
                  <TabsTrigger
                    value="all"
                    className="text-xs py-2.5 data-[state=active]:bg-background"
                  >
                    {t("All")}
                  </TabsTrigger>
                  {defaultOrderStatuses.map((status) => (
                    <TabsTrigger
                      key={status.label}
                      value={status.value}
                      className="text-xs py-2.5 data-[state=active]:bg-background"
                    >
                      {t(status.label)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="mt-4">
                <OrdersList
                  orders={formattedOrders}
                  searchQuery={searchQuery}
                  isLoading={ordersLoading || ordersFetching}
                />
              </div>
            </Tabs>

            {/* Pagination Controls */}
            {formattedOrders.length > 0 && totalPages > 1 && (
              <Pagination
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersPage;
