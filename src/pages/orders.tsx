import {
  useState,
  useEffect,
  ReactNode,
  PropsWithChildren,
  ButtonHTMLAttributes,
} from "react";
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
import { Package2, Truck, Ticket, Image } from "lucide-react";
import { cn, formattedDateAndTime, makeTwoDecimals } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { useConfig } from "@/hooks/useConfig";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ContactUsButton from "@/components/ui/contact-us-button";
import DefaultStorefront from "@/components/icons/DefaultStorefront";
import ProductPlaceholder from "@/components/ui/product-placeholder";

interface ConfirmOrderButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  condition: boolean | null | undefined;
}

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
  const queryClient = useQueryClient();
  const { config } = useConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentStatus = searchParams.get("status") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 5;

  // Refresh order data whenever we visit a single order page
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    }
  }, [id, queryClient]);

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
      shipping_details: order.shipping_details,
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

  const ConfirmOrderButton = ({
    condition,
    children,
    ...props
  }: PropsWithChildren<ConfirmOrderButtonProps>) => {
    return (
      <>
        {condition && (
          <div className="px-5">
            <button className="w-full main-btn" {...props}>
              {children}
            </button>
          </div>
        )}
      </>
    );
  };

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

            {/* Shipping Information */}
            {order.shipping_details && (
              <div className="p-5 space-y-4">
                <h2 className="text-sm font-medium tracking-wide">
                  {t("Shipping Information")}
                </h2>
                <div className="bg-darkgray rounded-lg p-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("Courier")}
                      </span>
                      <span className="text-sm font-medium">
                        {order.shipping_details.courier}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("Tracking Number")}
                      </span>
                      <span className="text-sm font-medium">
                        {order.shipping_details.tracking_number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("Shipped Date")}
                      </span>
                      <span className="text-sm font-medium">
                        {format(
                          order.shipping_details.shipped_at,
                          formattedDateAndTime
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      "before:absolute before:left-[14px]",
                      "before:w-[2px]",
                      event.isActive || event.isPending
                        ? "before:bg-gradient-to-b before:from-primary before:to-muted"
                        : "before:bg-primary",
                      event.isPending
                        ? "before:top-[30px] before:h-[calc(100%-24px)]"
                        : event.isActive
                        ? "before:top-9 before:h-[calc(100%-30px)]"
                        : "before:top-[30px] before:h-[calc(100%-30px)]",
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
                {order.order_items.map((item) => {
                  // TODO: Check if item is an event ticket, 'false' value will be replaced with the condition check
                  const isEvent = false;
                  const Total = ({ className }: { className?: string }) => (
                    <p
                      className={cn(
                        "font-medium text-card-foreground",
                        className
                      )}
                    >
                      {t("Total")}: ฿
                      {makeTwoDecimals(
                        item.unit_price * item.quantity
                      ).toLocaleString()}
                    </p>
                  );
                  const Quantity = ({ className }: { className?: string }) => (
                    <p className={cn("whitespace-pre", className)}>
                      {t("Quantity")}: {item.quantity}
                    </p>
                  );
                  return (
                    <div
                      className={cn("w-full relative", {
                        "grid grid-cols-3": isEvent,
                      })}
                    >
                      {isEvent && (
                        <>
                          <div className="bg-background h-14 w-14 rounded-full absolute top-[50%] -translate-y-[50%] -left-[44px]"></div>
                          <div className="bg-background h-14 w-14 rounded-full absolute top-[50%] -translate-y-[50%] -right-[44px]"></div>
                        </>
                      )}
                      <div
                        key={item.id}
                        className={cn("flex gap-5", {
                          "p-6 bg-darkgray rounded-lg items-center col-span-2 border-r-2 border-dashed border-r-background":
                            isEvent,
                        })}
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product_variants.product.image ? (
                            <img
                              src={item.product_variants.product.image}
                              alt={item.product_variants.product.name}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <ProductPlaceholder imageClassName="w-10 h-10" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-medium text-card-foreground truncate">
                              {item.product_variants.product.name}
                            </h3>
                          </div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <div className="space-y-2">
                              {item.product_variants.options?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.product_variants.options.map(
                                    (option, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                                      >
                                        {/* {option.name}:  */}
                                        {option.value}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                              <p>
                                {t("Unit Price")}: ฿
                                {makeTwoDecimals(
                                  item.unit_price
                                ).toLocaleString()}
                              </p>
                            </div>
                            {!isEvent && (
                              <div className="flex flex-col items-end justify-end gap-3">
                                <Quantity />
                                <Total />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {isEvent && (
                        <div className="flex flex-col p-6 bg-darkgray rounded-lg items-center gap-4">
                          <Quantity className="text-muted-foreground" />
                          <Button
                            className="rounded-full !bg-mainbutton text-[11px] h-6 px-2 w-full"
                            disabled={order.status === "pending"}
                          >
                            View Ticket
                          </Button>
                          <Total />
                        </div>
                      )}
                    </div>
                  );
                })}
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
                    ฿{makeTwoDecimals(order.subtotal).toLocaleString()}
                  </span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("Shipping")}
                    </span>
                    <span className="text-card-foreground">
                      ฿{makeTwoDecimals(order.shipping).toLocaleString()}
                    </span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("Tax")}</span>
                    <span className="text-card-foreground">
                      ฿{makeTwoDecimals(order.tax).toLocaleString()}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("Discount")}</span>
                    <span>
                      -฿{makeTwoDecimals(order.discount).toLocaleString()}
                    </span>
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
                      ฿{makeTwoDecimals(order.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Now Button */}
            <ConfirmOrderButton
              condition={
                order.status === "pending" &&
                order.total_amount > 0 &&
                !order.payment_details
              }
              onClick={handlePayNow}
            >
              {t("Pay Now")} (฿
              {makeTwoDecimals(order.total_amount).toLocaleString()})
            </ConfirmOrderButton>

            {/* View Tickets Button */}
            {/* <ConfirmOrderButton
              condition={
                order.status === "completed" &&
                !eventLoading &&
                event &&
                event.tickets.length > 0
              }
              onClick={handleViewTickets}
            >
              <Ticket className="w-4 h-4 mr-2" />
              {t("View Tickets")} ({event?.tickets.length})
            </ConfirmOrderButton> */}

            <ConfirmOrderButton
              condition={order.status === "processing"}
              disabled={true}
            >
              This order is in process...
            </ConfirmOrderButton>

            <ContactUsButton />
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
