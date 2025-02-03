import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { OrdersList } from "@/components/orders/OrdersList";
import { OrdersSearch } from "@/components/orders/OrdersSearch";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function MyOrdersPage() {
  const t = useTranslate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.status || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { orders, loading, error, totalPages, hasNextPage, hasPreviousPage } =
    useOrders(currentPage, ITEMS_PER_PAGE);

  const filteredOrders = orders
    ?.filter(
      (order) =>
        activeTab === "all" ||
        order.status === activeTab ||
        (activeTab === "completed" && order.status === "shipped")
    )
    .filter((order) =>
      order.order_items.some((item) =>
        item.product_variants.product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );

  const formattedOrders =
    filteredOrders?.map((order) => ({
      id: order.id,
      status: order.status === "shipped" ? "completed" : order.status,
      created_at: order.created_at,
      order_items: order.order_items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        variant_id: item.variant_id,
        product_variants: {
          name: item.product_variants.name,
          options: item.product_variants.options,
          product: {
            id: item.product_variants.product.id,
            name: item.product_variants.product.name,
            description: item.product_variants.product.description,
            image: item.product_variants.product.image,
          },
        },
      })),
      total_amount: order.total_amount,
    })) || [];

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeader title={t("My Orders")} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeader title={t("My Orders")} />
        <div className="p-4 text-center text-red-500">{error}</div>
      </div>
    );
  }

  const tabs = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title={t("My Orders")} />

      <div className="pt-14 pb-4">
        <OrdersSearch value={searchQuery} onChange={setSearchQuery} />

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="px-5 overflow-auto">
            <TabsList className="w-full h-auto p-1 bg-tertiary min-w-fit gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-xs py-2.5 data-[state=active]:bg-background"
                >
                  {t(tab.charAt(0).toUpperCase() + tab.slice(1))}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <OrdersList
              orders={formattedOrders}
              searchQuery={searchQuery}
              isLoading={loading}
            />
          </div>
        </Tabs>

        {/* Pagination Controls */}
        {!loading && formattedOrders.length > 0 && (
          <div className="flex items-center justify-between p-4 mt-4 border-t">
            <Button
              variant="outline"
              className="border-0"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("Previous")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {t("Page")} {currentPage} {t("of")} {totalPages}
            </div>
            <Button
              variant="outline"
              className="border-0"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!hasNextPage}
            >
              {t("Next")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
