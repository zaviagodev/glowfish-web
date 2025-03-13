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
import { Checkbox } from "@/components/ui/checkbox";
import CheckoutSkeletons from "@/components/skeletons/CheckoutSkeletons";

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
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [storeMessage, setStoreMessage] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [vatInvoiceData, setVatInvoiceData] = useState({
    enabled: false,
    companyName: "",
    taxId: "",
    branch: "",
    address: "",
  });
  const [isPaymentMethodRequired, setIsPaymentMethodRequired] = useState(false);

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
  const [isBillingAddressChecked, setIsBillingAddressChecked] = useState(true);

  // Function to check if a product is an event
  const checkForPhysicalProducts = async () => {
    setIsCheckingProducts(true);
    let hasPhysical = false;
    let totalEventPrice = 0;

    console.group("Checkout Product Check");
    console.log("Total Items:", items);

    try {
      for (const item of items) {
        console.log("Checking item:", item);

        const { data: variant, error: variantError } = await supabase
          .from("product_variants")
          .select("product_id, price")
          .eq("id", item.variantId)
          .single();

        console.log("Variant Data:", variant);
        console.log("Variant Error:", variantError);

        if (variantError) {
          continue;
        }

        if (variant) {
          // Check if this product is an event
          const { data: event, error: eventError } = await supabase
            .from("events")
            .select("id")
            .eq("product_id", variant.product_id)
            .single();

          console.log("Event Data:", event);
          console.log("Event Error:", eventError);

          if (!event) {
            // If there's no event entry, it's a physical product
            hasPhysical = true;
            console.log("Physical Product Detected");
          } else {
            // If it's an event, add its price
            totalEventPrice += variant.price * item.quantity;
            console.log("Event Price Added:", totalEventPrice);
          }
        }
      }

      console.log("Final Checks:", {
        hasPhysical,
        totalEventPrice,
        isPaymentMethodRequired: totalEventPrice > 0,
      });

      setHasPhysicalProducts(hasPhysical);
      setIsPaymentMethodRequired(totalEventPrice > 0);
    } catch (error: unknown) {
      console.error("Error in checkForPhysicalProducts:", error);

      // If there's an error, assume there are physical products and paid events to be safe
      setHasPhysicalProducts(true);
      setIsPaymentMethodRequired(true);
    } finally {
      console.log("Checking Products Complete");
      console.groupEnd();
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
    return <CheckoutSkeletons />;
  }

  // Calculate order summary
  const subtotal = items.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0
  );
  const discount = getTotalDiscount(subtotal);
  const pointsDiscount = getDiscountAmount();
  const total = subtotal - discount - pointsDiscount;

  const handleCreateOrder = async (event?: React.MouseEvent) => {
    // Prevent default behavior
    event?.preventDefault();

    // Validation function
    const validateOrderCreation = () => {
      // Check if there are any paid events
      const paidEvents = items.filter((item: CartItem) => item.price > 0);

      // Validation checks
      if (isPaymentMethodRequired) {
        if (paidEvents.length > 0) {
          // Explicitly check for payment method
          if (!paymentMethod) {
            alert(t("Please select a payment method for paid events"));
            return false;
          }
        }
      }

      // Validate delivery address for physical products
      if (hasPhysicalProducts && !selectedAddress) {
        alert(t("Please select a delivery address"));
        return false;
      }

      // Additional price validation
      const totalEventPrice = items.reduce((total: number, item: CartItem) => {
        return total + item.price * item.quantity;
      }, 0);

      if (totalEventPrice > 0 && !paymentMethod) {
        alert(t("Payment method is required for events with a price"));
        return false;
      }

      return true;
    };

    // Perform validation
    if (!validateOrderCreation()) {
      return;
    }

    // Rest of the existing order creation logic
    setIsProcessing(true);
    try {
      // Existing validation checks
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
      alert(error instanceof Error ? error.message : "Cannot place order");
      setIsProcessing(false);
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
                title={t("Shipping Address")}
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
                icon={
                  <div className="w-8 h-8 rounded-lg bg-icon-blue-background flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-icon-blue-foreground" />
                  </div>
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p>Billing address same as shipping address</p>
              <p className="text-muted-foreground">
                Uncheck if you want to change to another address
              </p>
            </div>
            <Checkbox
              checked={isBillingAddressChecked}
              onCheckedChange={() =>
                setIsBillingAddressChecked(!isBillingAddressChecked)
              }
            />
          </div>

          {!isBillingAddressChecked && (
            <div
              onClick={() =>
                navigate("/checkout/address", {
                  state: { selectedItems: items },
                })
              }
            >
              {/* TODO: The address info may change based on the difference of billing and shipping address */}
              <AddressCard
                title={t("Billing Address")}
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
                icon={
                  <div className="w-8 h-8 rounded-lg bg-icon-blue-background flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-icon-blue-foreground" />
                  </div>
                }
              />
            </div>
          )}

          {(isPaymentMethodRequired || hasPhysicalProducts) && (
            <PaymentMethod
              value={paymentMethod}
              onChange={setPaymentMethod}
              required={isPaymentMethodRequired}
            />
          )}

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
          (isPaymentMethodRequired && !paymentMethod)
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
