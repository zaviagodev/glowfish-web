import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useCoupons } from "@/lib/coupon";
import { usePoints } from "@/lib/points";
import { useOrders } from "@/hooks/useOrders";
import { supabase } from "@/lib/supabase";
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

export default function CheckoutPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { items: allItems } = useCart();
  const { getTotalDiscount } = useCoupons();
  const { getDiscountAmount } = usePoints();
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
    address: ""
  });

  // Get selected items from location state, fallback to all items if accessed directly
  const items = location.state?.selectedItems || allItems;

  // Redirect to cart if accessed directly without selected items
  if (!location.state?.selectedItems) {
    navigate('/cart', { replace: true });
    return null;
  }

  // Calculate order summary
  const subtotal = items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  const discount = getTotalDiscount(subtotal);
  const pointsDiscount = getDiscountAmount();
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal - discount - pointsDiscount + tax;

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    try {
      // Validate cart is not empty
      if (items.length === 0) {
        throw new Error('Cart is empty');
      }

      if (paymentMethod === 'promptpay') {
        navigate('/checkout/payment');
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare order items with variant IDs
      const orderItems = items.map(item => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      }));

      // Create order using place_order function
      const { data: newOrder, error } = await supabase.rpc('place_order', {
        p_store_name: 'glowfish',
        p_customer_id: user.id,
        p_status: 'pending',
        p_subtotal: subtotal,
        p_discount: discount + pointsDiscount,
        p_shipping: 0,
        p_tax: tax,
        p_total: total,
        p_notes: JSON.stringify({
          message: storeMessage,
          vatInvoice: vatInvoiceData.enabled ? vatInvoiceData : null,
          paymentMethod: paymentMethod
        }),
        p_tags: ['web'],
        p_items: orderItems
      });

      if (error) {
        console.error('Order creation error:', error);
        throw new Error(error.message || 'Failed to create order');
      }

      if (!newOrder) {
        throw new Error('No order data returned');
      }

      // Refresh orders after successful creation
      await refreshOrders();
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(t(error instanceof Error ? error.message : "Failed to process order. Please try again."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("Checkout")} />

      <div className="pt-14 pb-32">
        <div className="p-4 space-y-6">
          <AddressCard
            title={t("Delivery Address")}
            name="John Doe"
            phone="(+66) 123-456-789"
            address="123 Sample Street, Bangkok, 10110"
          />

          <ProductList 
            items={items}
            storeMessage={storeMessage}
            vatInvoiceData={vatInvoiceData}
            onMessageClick={() => setShowMessageDialog(true)} 
            onVatClick={() => navigate('/checkout/vat-invoice')}
          />

          <PointsCoupons subtotal={subtotal} />

          <PaymentMethod 
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            pointsDiscount={pointsDiscount}
            shipping={0}
            tax={tax}
            total={total}
          />
        </div>
      </div>

      <CheckoutFooter
        total={total}
        isProcessing={isProcessing}
        onPlaceOrder={handleCreateOrder}
      />

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
      />
      
      <MessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        initialMessage={storeMessage}
        onSave={setStoreMessage}
      />
    </div>
  );
}