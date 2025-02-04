import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import { CartItem as CartItemType, useCart } from "@/lib/cart";
import { useCoupons } from "@/lib/coupon";
import { usePoints } from "@/lib/points";
import { useCustomer } from "@/hooks/useCustomer";
import { useOrders } from "@/hooks/useOrders";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/components/shared/AddressCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductList } from "@/components/checkout/ProductList";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PointsCoupons } from "@/components/checkout/PointsCoupons";
import { MessageDialog } from "@/components/checkout/MessageDialog";
import { CheckoutFooter } from "@/components/checkout/CheckoutFooter";
import { ShippingMethod } from "@/components/checkout/ShippingMethod";
import { SuccessDialog } from "@/components/checkout/SuccessDialog";
import type { Address } from "@/services/customerService";

interface CartItem {
  variantId: string;
  quantity: number;
  price: number;
}

export default function CheckoutPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { items: allItems, clearCart } = useCart();
  const { getTotalDiscount } = useCoupons();
  const { getDiscountAmount } = usePoints();
  const { customer, loading: customerLoading } = useCustomer();
  const { refreshOrders } = useOrders();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [storeMessage, setStoreMessage] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [vatInvoiceData, setVatInvoiceData] = useState({
    enabled: false,
    companyName: "",
    taxId: "",
    branch: "",
    address: "",
  });

  // Get selected items from location state, fallback to all items if accessed directly
  const items = location.state?.selectedItems || allItems;

  // Get customer addresses and default address
  const addresses = customer?.addresses || [];
  const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];

  // Redirect to cart if accessed directly without selected items
  if (!location.state?.selectedItems) {
    navigate("/cart", { replace: true });
    return null;
  }

  // Calculate order summary
  const subtotal = items.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0
  );
  const discount = getTotalDiscount(subtotal);
  const pointsDiscount = getDiscountAmount();
  const total = subtotal - discount - pointsDiscount;

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    try {
      // Validate cart is not empty
      if (items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare order items with variant IDs
      const orderItems = items.map((item: CartItem) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }));

      // Create order using place_order function
      const { data: newOrder, error } = await supabase.rpc("place_order", {
        p_store_name: "glowfish",
        p_customer_id: user.id,
        p_status: "pending",
        p_subtotal: subtotal,
        p_discount: discount + pointsDiscount,
        p_shipping: 0,
        p_tax: 0,
        p_total: total,
        p_notes: JSON.stringify({
          message: storeMessage,
          vatInvoice: vatInvoiceData.enabled ? vatInvoiceData : null,
          paymentMethod: "promptpay",
        }),
        p_tags: ["web"],
        p_items: orderItems,
      });

      if (error) {
        console.error("Order creation error:", error);
        throw new Error(error.message || "Failed to create order");
      }

      if (!newOrder) {
        throw new Error("No order data returned");
      }

      // Clear the cart
      clearCart();
      
      // Refresh orders using useOrders hook
      await refreshOrders();

      // Check if order total is 0
      if (total === 0) {
        setShowSuccess(true);
      } else {
        // Navigate to payment page with order ID
        navigate(`/checkout/payment/${newOrder[0]?.order_id}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert(
        t(
          error instanceof Error
            ? error.message
            : "Failed to process order. Please try again."
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (customerLoading) {
    return <div className="min-h-dvh bg-background pt-14">Loading...</div>;
  }

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title={t("Checkout")} />

      <div className="pt-14 pb-48">
        <div className="p-5 space-y-6">
          <ProductList items={items} />
          {defaultAddress ? (
            <div onClick={() => navigate("/checkout/address")}>
              <AddressCard
                title={t("Delivery Address")}
                name={`${defaultAddress.first_name} ${defaultAddress.last_name}`}
                phone={defaultAddress.phone}
                address={`${defaultAddress.address1}${defaultAddress.address2 ? `, ${defaultAddress.address2}` : ''}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postal_code}`}
              />
            </div>
          ) : (
            <Button
              onClick={() => navigate("/checkout/address")}
              className="w-full"
            >
              {t("Add Delivery Address")}
            </Button>
          )}

          {/* <PointsCoupons subtotal={subtotal} /> */}

          <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />

          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            pointsDiscount={pointsDiscount}
            shipping={0}
            total={total}
          />
        </div>
      </div>

      <CheckoutFooter
        total={total}
        isProcessing={isProcessing}
        onPlaceOrder={handleCreateOrder}
        storeMessage={storeMessage}
        vatInvoiceData={vatInvoiceData}
        onMessageClick={() => setShowMessageDialog(true)}
        onVatClick={() => navigate("/checkout/vat-invoice")}
      />

      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} />

      <MessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        initialMessage={storeMessage}
        onSave={setStoreMessage}
      />
    </div>
  );
}
