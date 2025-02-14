import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import { CartItem as CartItemType, useCart } from "@/lib/cart";
import { useCoupons } from "@/lib/coupon";
import { usePoints } from "@/lib/points";
import { useCustomer } from "@/hooks/useCustomer";
import { useOrders } from "@/hooks/useOrders";
import { useStore } from "@/hooks/useStore";
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
  const { storeName } = useStore();
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
  const defaultAddress =
    addresses.find((addr) => addr.is_default) || addresses[0];

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
        p_store_name: storeName,
        p_customer_id: customer.id,
        p_status: "pending",
        p_subtotal: subtotal,
        p_shipping: 0,
        p_tax: 0,
        p_total: total,
        p_shipping_address_id: defaultAddress?.id,
        p_billing_address_id: defaultAddress?.id, // Using same address for billing
        p_applied_coupons: [], // Add actual coupon codes if available
        p_loyalty_points_used: 0, // Add actual points used if available
        p_notes: JSON.stringify({
          message: storeMessage,
          vatInvoice: vatInvoiceData.enabled ? vatInvoiceData : null,
          paymentMethod,
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
      localStorage.removeItem("cart");

      // Refresh orders list
      await refreshOrders();

      // Redirect based on order total
      if (total > 0) {
        // If total is greater than 0, redirect to payment page
        navigate(`/checkout/payment/${newOrder[0]?.order_id}`);
      } else {
        // If total is 0, redirect to thank you page
        navigate('/checkout/thank-you', {
          state: {
            orderNumber: newOrder[0]?.order_id,
            amount: total,
            date: new Date().toISOString()
          }
        });
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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageHeader title={t("Checkout")} />

      <div className="pt-14 pb-32">
        <div className="p-5 space-y-6">
          <ProductList items={items} />
          {defaultAddress ? (
            <div onClick={() => navigate("/checkout/address")}>
              <AddressCard
                title={t("Delivery Address")}
                name={`${defaultAddress.first_name} ${defaultAddress.last_name}`}
                phone={defaultAddress.phone}
                address={`${defaultAddress.address1}${
                  defaultAddress.address2 ? `, ${defaultAddress.address2}` : ""
                }, ${defaultAddress.city}, ${defaultAddress.state} ${
                  defaultAddress.postal_code
                }`}
              />
            </div>
          ) : (
            <Button
              onClick={() => navigate("/checkout/address")}
              className="w-full main-btn"
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
