import { PageHeader } from "@/components/shared/PageHeader";
import NoItemsComp from "@/components/ui/no-items";
import {
  useRewardOrders,
  useRewardOrder,
} from "@/features/rewards/hooks/useRewards";
import { MyReward } from "@/features/rewards/components/MyReward";
import {
  Package2,
  ArrowLeft,
  Calendar,
  Gift,
  User,
  Tag,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Receipt,
  Image,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import TicketsSkeletons from "@/components/skeletons/TicketsSkeletons";
import ProductPlaceholder from "@/components/ui/product-placeholder";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const RewardOrderDetails = ({ orderId }: { orderId: string }) => {
  const navigate = useNavigate();
  const { order, loading } = useRewardOrder(orderId);
  const [isBarcode, setIsBarcode] = useState(false);
  const currency = "฿";

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader title="Reward Order Details" />
        <TicketsSkeletons />
      </div>
    );
  }

  if (!order) {
    return <NoItemsComp icon={Package2} text="Order not found" />;
  }

  const rewardItem = order.order_items.find((item) => item.meta_data.reward);
  const product = rewardItem?.product_variant.product;
  const image = product?.images[0];
  const orderStatusColors = {
    completed: "bg-icon-green-background text-icon-green-foreground",
    processing: "bg-icon-blue-background text-icon-blue-foreground",
    cancelled: "bg-icon-red-background text-icon-red-foreground",
    pending: "bg-icon-orange-background text-icon-orange-foreground",
  };

  return (
    <div className="space-y-6">
      {/* Order Status */}
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">
              Order #{order.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              orderStatusColors[order.status]
            )}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Product Image */}
        {image ? (
          <img
            src={image.url}
            alt={image.alt || product?.name || "Reward"}
            className="w-full h-full object-cover rounded-lg aspect-square"
          />
        ) : (
          <ProductPlaceholder className="aspect-square rounded-lg" />
        )}

        {/* Reward details */}
        <div className="space-y-2 my-6">
          <h4 className="font-medium">Item Reward Name</h4>
          <p className="text-muted-foreground">{product?.name}</p>
        </div>

        {/* Order Details Grid */}
        <div className="flex flex-col gap-6">
          {/* Customer Information */}
          {/* <div className="space-y-4">
            <h4 className="font-medium">Customer Information</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>
                  {order.customer_first_name} {order.customer_last_name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.customer_phone}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {order.customer_email}
              </div>
            </div>
          </div> */}

          {/* Shipping Information */}
          {/* <div className="space-y-4">
            <h4 className="font-medium">Shipping Information</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Address ID: {order.shipping_address_id}</span>
              </div>
              {order.shipping_option && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span>{order.shipping_option}</span>
                </div>
              )}
            </div>
          </div> */}

          {/* Order Summary */}
          <div className="space-y-4">
            <h4 className="font-medium">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {currency}
                  {order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>
                  {currency}
                  {order.discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {currency}
                  {order.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>
                  {currency}
                  {order.tax.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    {currency}
                    {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Points Information */}
          <div className="space-y-4 pb-2 border-b">
            <h4 className="font-medium">Points Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points Used</span>
                <span>{order.loyalty_points_used} points</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-muted-foreground">Points Rate</span>
                <span>{order.loyalty_points_rate}</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points Discount</span>
                <span>
                  {currency}
                  {order.points_discount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center mt-6">
          {/* Check if 'rewards' exists and has at least one entry before accessing it */}
          {order.rewards && order.rewards.length > 0 && (
            <>
              <div className="mb-3 font-bold">NO. {order.rewards[0].code}</div>
              <div className="w-40 h-40 rounded-lg bg-foreground text-background flex items-center justify-center text-2xl mb-4">
                <QRCodeCanvas
                  value={`${
                    import.meta.env.VITE_ADMIN_URL
                  }/dashboard/events/record-attendance?ticket_code=${
                    order.rewards[0].code
                  }`}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p
                className="text-sm text-muted-foreground"
                onClick={() => setIsBarcode(!isBarcode)}
              >
                {isBarcode ? "Switch to QR Code" : "Switch to Barcode"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MyRewardsPage = () => {
  const { orderId } = useParams();
  const { orders, loading } = useRewardOrders();
  const navigate = useNavigate();

  if (orderId) {
    return (
      <div className="pt-14">
        <PageHeader
          title="Reward Order Details"
          onBack={() => navigate("/my-rewards")}
        />
        <div className="max-width-mobile mx-auto p-5">
          <RewardOrderDetails orderId={orderId} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-14">
        <PageHeader title="My Rewards" />
        <TicketsSkeletons />
      </div>
    );
  }

  return (
    <div className="pt-14">
      <PageHeader title="My Rewards" onBack={() => navigate("/rewards")} />
      <div className="max-width-mobile mx-auto p-5">
        {orders.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
              My Rewards ({orders.length})
            </h2>
            <div className="grid gap-6">
              {orders.map((order) => (
                <MyReward key={order.id} order={order} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <NoItemsComp
              icon={Package2}
              text="No rewards found"
              description="You haven't earned any rewards yet. Keep shopping to earn points!"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRewardsPage;
