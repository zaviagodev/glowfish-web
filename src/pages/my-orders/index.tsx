import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { OrdersList } from "@/components/orders/OrdersList";
import { OrdersSearch } from "@/components/orders/OrdersSearch";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MyOrdersPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { 
    orders, 
    loading, 
    error,
    totalPages,
    hasNextPage,
    hasPreviousPage 
  } = useOrders(currentPage, ITEMS_PER_PAGE);

  const filteredOrders = orders?.filter(order => 
    activeTab === "all" || (order.status === activeTab || (activeTab === "completed" && order.status === "shipped"))
  ).filter(order =>
    order.order_items.some(item => 
      item.product_variants.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formattedOrders = filteredOrders?.map(order => ({
    id: order.id,
    status: order.status === "shipped" ? "completed" : order.status,
    created_at: order.created_at,
    order_items: order.order_items.map(item => ({
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
          image: item.product_variants.product.image
        }
      }
    })),
    total_amount: order.total_amount
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

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title={t("My Orders")} />

      <div className="pt-14 pb-4">
        <OrdersSearch value={searchQuery} onChange={setSearchQuery} />

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="px-4 overflow-auto">
            <TabsList className="w-full h-auto p-1 bg-tertiary min-w-fit gap-1">
              <TabsTrigger
                value="all"
                className="text-xs py-2.5 data-[state=active]:bg-background"
              >
                {t("All")}
              </TabsTrigger>
              <TabsTrigger
                value="processing"
                className="text-xs py-2.5 data-[state=active]:bg-background"
              >
                {t("Processing")}
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                className="text-xs py-2.5 data-[state=active]:bg-background"
              >
                {t("Confirmed")}
              </TabsTrigger>
              <TabsTrigger
                value="shipped"
                className="text-xs py-2.5 data-[state=active]:bg-background"
              >
                {t("Shipped")}
              </TabsTrigger>
              <TabsTrigger
                value="delivered"
                className="text-xs py-2.5 data-[state=active]:bg-background"
              >
                {t("Delivered")}
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="text-xs py-2.5 data-[state=active]:bg-background"
              >
                {t("Cancelled")}
              </TabsTrigger>
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
          <div className="flex items-center justify-between px-4 py-4 mt-4 bg-white border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
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