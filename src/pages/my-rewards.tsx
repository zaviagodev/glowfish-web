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
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import TicketsSkeletons from "@/components/skeletons/TicketsSkeletons";

const RewardOrderDetails = ({ orderId }: { orderId: string }) => {
  const navigate = useNavigate();
  const { order, loading } = useRewardOrder(orderId);

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader title="My Rewards" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/my-rewards")}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold">Order Details</h2>
      </div>

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
              "px-4 py-2 rounded-full text-sm font-medium",
              order.status === "completed" && "bg-green-100 text-green-800",
              order.status === "processing" && "bg-yellow-100 text-yellow-800",
              order.status === "cancelled" && "bg-red-100 text-red-800",
              order.status === "pending" && "bg-gray-100 text-gray-800"
            )}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Product Image */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product?.name || "Reward"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package2 className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
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
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
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
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h4 className="font-medium">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>${order.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Points Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points Used</span>
                <span>{order.loyalty_points_used} points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points Rate</span>
                <span>{order.loyalty_points_rate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points Discount</span>
                <span>${order.points_discount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyRewardsPage = () => {
  const { orderId } = useParams();
  const { orders, loading } = useRewardOrders();

  if (orderId) {
    return (
      <div className="pt-14">
        <PageHeader title="My Rewards" />
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
      <PageHeader title="My Rewards" />
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
