import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { OrdersList } from "@/components/orders/OrdersList";
import { OrdersSearch } from "@/components/orders/OrdersSearch";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";

export default function MyOrdersPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { orders } = useOrders();

  const filteredOrders = orders
    ?.filter(
      (order) =>
        activeTab === "all" ||
        order.status === activeTab ||
        (activeTab === "completed" && order.status === "shipped")
    )
    .filter((order) =>
      order.order_items.some((item) =>
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const formattedOrders =
    filteredOrders?.map((order) => ({
      id: order.id,
      status: order.status === "shipped" ? "completed" : order.status,
      date: order.created_at,
      customer: {
        name: `${order.customer.first_name} ${order.customer.last_name}`,
        email: order.customer.email,
        avatar: order.customer.avatar_url,
      },
      items: order.order_items.map((item) => ({
        id: item.id,
        name: item.product.name,
        image: item.product.image || "/placeholder-image.jpg",
        price: item.unit_price,
        quantity: item.quantity,
        variant: item.name,
      })),
      total: order.total_amount,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      discount: order.discount,
    })) || [];

  return (
    <div className="min-h-screen bg-background">
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
            <OrdersList orders={formattedOrders} searchQuery={searchQuery} />
          </div>
        </Tabs>
      </div>
    </div>
  );
}
