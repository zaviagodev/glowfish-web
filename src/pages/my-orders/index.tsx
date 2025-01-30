import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { OrdersList } from "@/components/orders/OrdersList";
import { OrdersSearch } from "@/components/orders/OrdersSearch";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";

// Mock order data
const mockOrders = [
  {
    id: "1",
    status: "processing",
    date: "2024-01-20T10:30:00",
    items: [
      {
        id: "1",
        name: "Product 1",
        image: "https://picsum.photos/200",
        price: 1500,
        quantity: 2,
      },
    ],
    total: 3000,
  },
  {
    id: "2",
    status: "shipping",
    date: "2024-01-19T15:45:00",
    tracking: {
      number: "TH1234567890",
      status: "Out for Delivery",
      location: "Bangkok, Thailand",
      lastUpdate: "2 hours ago",
    },
    items: [
      {
        id: "2",
        name: "Jameson Live Music Event Ticket",
        image: "https://picsum.photos/201",
        price: 1500,
        quantity: 1,
      },
    ],
    total: 7300,
  },
  {
    id: "3",
    status: "completed",
    date: "2024-01-18T09:15:00",
    tracking: {
      number: "TH9876543210",
      status: "Delivered",
      location: "Bangkok, Thailand",
      lastUpdate: "Jan 19, 2024",
    },
    items: [
      {
        id: "3",
        name: "Jameson Live Music Event Ticket",
        image: "https://picsum.photos/202",
        price: 2000,
        quantity: 1,
      },
      {
        id: "4",
        name: "Paradise Bangkok Event Ticket",
        image: "https://picsum.photos/203",
        price: 1500,
        quantity: 2,
      },
      {
        id: "5",
        name: "Music Afterwork Event Ticket",
        image: "https://picsum.photos/204",
        price: 1800,
        quantity: 1,
      },
    ],
    total: 6800,
  },
];

export default function MyOrdersPage() {
  const t = useTranslate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { orders } = useOrders();

  // TODO: Will switch to actual orders
  // const filteredOrders = orders
  //   ?.filter(
  //     (order) =>
  //       activeTab === "all" ||
  //       order.status === activeTab ||
  //       (activeTab === "completed" && order.status === "shipped")
  //   )
  //   .filter((order) =>
  //     order.order_items.some((item) =>
  //       item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  //     )
  //   );

  // This is a temporary variable, it will be removed after the actual orders are correctly fetched
  const filteredOrders = mockOrders
    .filter((order) => activeTab === "all" || order.status === activeTab)
    .filter((order) =>
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  // const formattedOrders =
  //   filteredOrders?.map((order) => ({
  //     id: order.id,
  //     status: order.status === "shipped" ? "completed" : order.status,
  //     date: order.created_at,
  //     customer: {
  //       name: `${order.customer.first_name} ${order.customer.last_name}`,
  //       email: order.customer.email,
  //       avatar: order.customer.avatar_url,
  //     },
  //     items: order.order_items.map((item) => ({
  //       id: item.id,
  //       name: item.product.name,
  //       image: item.product.image || "/placeholder-image.jpg",
  //       price: item.unit_price,
  //       quantity: item.quantity,
  //       variant: item.name,
  //     })),
  //     total: order.total_amount,
  //     subtotal: order.subtotal,
  //     shipping: order.shipping,
  //     tax: order.tax,
  //     discount: order.discount,
  //   })) || [];

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
            {/* TODO: Will switch to actual orders after they are correctly fetched
              <OrdersList orders={formattedOrders} searchQuery={searchQuery} /> 
            */}
            <OrdersList orders={filteredOrders} searchQuery={searchQuery} />
          </div>
        </Tabs>
      </div>
    </div>
  );
}
