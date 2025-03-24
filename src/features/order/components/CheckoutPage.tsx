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
import { Checkbox } from "@/components/ui/checkbox";
import CheckoutSkeletons from "@/components/skeletons/CheckoutSkeletons";
import { Switch } from "@/components/ui/switch";
import { ShippingMethodSelection } from "./ShippingMethodSelection";
import { useShipping } from "../hooks/useShipping";
import { cn } from "@/lib/utils";

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
  const [isUsingPoints, setIsUsingPoints] = useState(false);
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

  // Validate prices when items change
  useEffect(() => {
    if (items.length > 0) {
      const hasInvalidPrices = items.some((item: CartItem) => item.price < 0);
      if (hasInvalidPrices) {
        alert(
          t(
            "Some items have invalid prices. Please return to cart and try again."
          )
        );
        navigate("/cart", { replace: true });
      }
    }
  }, [items, navigate, t]);

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

  const {
    shippingMethods,
    selectedMethod,
    shippingCost,
    loading: shippingLoading,
    error: shippingError,
    selectShippingMethod,
  } = useShipping(items);

  // Function to check if a product is an event
  const checkForPhysicalProducts = async () => {
    setIsCheckingProducts(true);
    let hasPhysical = false;
    let totalEventPrice = 0;

    console.group("Checkout Product Check");

    try {
      for (const item of items) {

        const { data: variant, error: variantError } = await supabase
          .from("product_variants")
          .select("product_id, price")
          .eq("id", item.variantId)
          .single();


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
  const total = subtotal - discount - pointsDiscount + shippingCost;

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

    // Add shipping method validation
    if (hasPhysicalProducts && shippingMethods.options && shippingMethods.options.length > 0 && !selectedMethod) {
      alert(t("Please select a shipping method"));
      return;
    }

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
        p_subtotal: Number(subtotal),
        p_shipping: Number(shippingCost),
        p_tax: 0,
        p_total: Number(total),
        p_shipping_address_id: hasPhysicalProducts ? selectedAddress.id : null,
        p_billing_address_id: hasPhysicalProducts ? selectedAddress.id : null,
        p_shipping_option_id: hasPhysicalProducts ? selectedMethod?.id : null,
        p_applied_coupons:
          discount > 0 ? [{ code: "discount", amount: discount }] : [],
        p_loyalty_points_used: Number(pointsDiscount),
        p_notes: JSON.stringify({
          message: storeMessage,
          vatInvoice: vatInvoiceData.enabled ? vatInvoiceData : null,
          paymentMethod,
        }),
        p_tags: ["web"],
        p_items: orderItems.map(
          (item: { variant_id: string; quantity: number; price: number }) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: Number(item.price),
            total: Number(item.price * item.quantity),
          })
        ),
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

  /* TODO: Will change to total dynamic points*/
  const totalPoints = 320;
  const canRedeemPoints = totalPoints <= customer?.loyalty_points;

  return (
    <div className="bg-background">
      <PageHeader title={t("Checkout")} />

      <div className="pt-14 pb-32">
        <div className="p-5 space-y-3.5">
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

          {/* {hasPhysicalProducts && (
            <>
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
                  TODO: The address info may change based on the difference of billing and shipping address
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
            </>
          )} */}

          {/* Add shipping method selection after address selection */}
          {hasPhysicalProducts && (
            <div className="mt-6">
              <ShippingMethodSelection
                methods={shippingMethods}
                selectedMethod={selectedMethod}
                onSelect={selectShippingMethod}
                loading={shippingLoading}
                error={shippingError}
              />
            </div>
          )}

          {/* <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h2 className="text-base font-normal flex items-center gap-1">
                {/* TODO: Set the dynamic points to use
                <span
                  className={cn(
                    "text-sm font-medium",
                    canRedeemPoints
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  Points to use: {totalPoints.toLocaleString()}
                </span>
                <span className="text-orangefocus text-xs">
                  (Available: {customer?.loyalty_points?.toLocaleString() || 0})
                </span>
              </h2>
              <p
                className={cn("text-muted-foreground", {
                  "opacity-40": !canRedeemPoints,
                })}
              >
                Enable when you want to buy with your points
              </p>
            </div>
            <Switch
              onCheckedChange={setIsUsingPoints}
              disabled={!canRedeemPoints}
            />
          </div> */}

          {(isPaymentMethodRequired || hasPhysicalProducts) &&
            !isUsingPoints && (
              <PaymentMethod
                value={paymentMethod}
                onChange={setPaymentMethod}
                required={isPaymentMethodRequired}
              />
            )}

          {/* I just added the coupon selection section, will set the dynamic data later */}
          {/* {!isUsingPoints && <PointsCoupons subtotal={subtotal} />} */}

          {/* TODO: Replace '320' with dynamic points */}
          <OrderSummary
            subtotal={isUsingPoints ? totalPoints : subtotal}
            discount={discount}
            pointsDiscount={pointsDiscount}
            shipping={shippingCost}
            total={isUsingPoints ? totalPoints : total}
            isUsingPoints={isUsingPoints}
          />
        </div>
      </div>

      {/* TODO: Replace '320' with dynamic points */}
      <CheckoutFooter
        total={isUsingPoints ? totalPoints : total}
        isUsingPoints={isUsingPoints}
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
