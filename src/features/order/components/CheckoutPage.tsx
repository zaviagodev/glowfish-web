import { useState, useEffect } from "react";
import { useTranslate } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import { CartItem as CartItemType, useCart } from "@/lib/cart";
import { useCoupons } from "@/lib/coupon";
import { usePoints } from "@/lib/points";
import { useCustomer } from "@/hooks/useCustomer";
import { useOrders } from "@/features/orders";
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
import { ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpin from "@/components/loading/LoadingSpin";

interface CartItem extends CartItemType {
  variantId: string;
  quantity: number;
  price: number;
}

export function CheckoutPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { items: allItems, clearCart, addItem } = useCart();
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

  // Get customer addresses and selected or default address
  const addresses = customer?.addresses || [];
  const selectedAddress =
    location.state?.selectedAddress ||
    addresses.find((addr) => addr.is_default) ||
    addresses[0];

  // Check if all items are events
  const [hasPhysicalProducts, setHasPhysicalProducts] = useState(false);
  const [isCheckingProducts, setIsCheckingProducts] = useState(true);

  // Function to check if a product is an event
  const checkForPhysicalProducts = async () => {
    setIsCheckingProducts(true);
    try {
      for (const item of items) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("product_id")
          .eq("id", item.variantId)
          .single();

        if (variant) {
          // Check if this product is NOT an event
          const { data: event } = await supabase
            .from("events")
            .select("id")
            .eq("product_id", variant.product_id)
            .single();

          if (!event) {
            // If there's no event entry, it's a physical product
            setHasPhysicalProducts(true);
            break;
          }
        }
      }
    } catch (error: unknown) {
      console.error(
        "Error checking for physical products:",
        error instanceof Error ? error.message : "Unknown error"
      );
      // If there's an error, assume there are physical products to be safe
      setHasPhysicalProducts(true);
    } finally {
      setIsCheckingProducts(false);
    }
  };

  // Check for physical products when items change
  useEffect(() => {
    checkForPhysicalProducts();
  }, [items]);

  // Redirect to cart if accessed directly without selected items
  if (!location.state?.selectedItems) {
    navigate("/cart", { replace: true });
    return null;
  }

  if (isCheckingProducts || customerLoading) {
    return <LoadingSpin />;
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

      // Validate delivery address for physical products
      if (hasPhysicalProducts && !selectedAddress) {
        throw new Error("Please select a delivery address");
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
        p_shipping_address_id: hasPhysicalProducts ? selectedAddress.id : null,
        p_billing_address_id: hasPhysicalProducts ? selectedAddress.id : null,
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

      // Clear the ordered items from cart
      const orderedVariantIds = orderItems.map(
        (item: { variant_id: string }) => item.variant_id
      );
      const remainingItems = allItems.filter(
        (item: CartItem) => !orderedVariantIds.includes(item.variantId)
      );
      clearCart();
      remainingItems.forEach((item: CartItem) => addItem(item));

      // Refresh orders list
      await refreshOrders();

      // Redirect based on order total
      if (total > 0) {
        navigate(`/checkout/payment/${newOrder[0]?.order_id}`);
      } else {
        navigate("/checkout/thank-you", {
          state: {
            orderNumber: newOrder[0]?.order_id,
            amount: total,
            date: new Date().toISOString(),
          },
        });
      }
    } catch (error: unknown) {
      console.error(
        "Error creating order:",
        error instanceof Error ? error.message : "Unknown error"
      );
      alert(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background">
      <PageHeader title={t("Checkout")} />

      <div className="pt-14 pb-32">
        <div className="p-5 space-y-6">
          <ProductList items={items} />

          {/* Only show address selection for physical products */}
          {hasPhysicalProducts && (
            <div
              onClick={() =>
                navigate("/checkout/address", {
                  state: { selectedItems: items },
                })
              }
            >
              <AddressCard
                title={t("Delivery Address")}
                name={`${selectedAddress?.first_name} ${selectedAddress?.last_name}`}
                phone={selectedAddress?.phone}
                address={`${selectedAddress?.address1}${
                  selectedAddress?.address2
                    ? `, ${selectedAddress?.address2}`
                    : ""
                }, ${selectedAddress?.city}, ${selectedAddress?.state} ${
                  selectedAddress?.postal_code
                }`}
                isDefault={!!selectedAddress}
              />
            </div>
          )}

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
        disabled={
          (hasPhysicalProducts && addresses.length === 0) ||
          paymentMethod === "cash"
        }
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
