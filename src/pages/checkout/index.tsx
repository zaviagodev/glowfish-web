import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/main/Header";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@refinedev/core";
import { QuestionChat } from "@/components/icons/MainIcons";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
} from "@/components/ui/sheet";
import { useEvents } from "@/hooks/useEvents";


const CheckoutPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { productId, variantId, productName, variantName, price, image } = location.state || {};
  const paymentMethods = ["QR Code", "Bank account"];
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshEvents } = useEvents();


  const totalPrice = price * 1.07;
  const tax = price * 0.07;

  const handleCreateOrder = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create order using RPC
      const { data: newOrder, error } = await supabase.rpc('place_order', {
        p_store_name: 'glowfish', // Replace with actual store name
        p_customer_id: user.id,
        p_status: 'pending',
        p_subtotal: price,
        p_discount: 0,
        p_shipping: 0,
        p_tax: tax,
        p_total: totalPrice,
        p_notes: null,
        p_tags: [],
        p_items: [{
          variant_id: variantId,
          quantity: 1,
          price: price,
          total: price
        }]
      });

      if (error) throw error;
      // Show thank you message
      setShowThankYou(true);
      refreshEvents();

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header title={t("Checkout")} rightButton={t("Detail")}/>
      <section className="flex flex-col gap-6 mb-[200px]">
        {image && <img src={image} className="rounded-xl"/>}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-center">{productName}</h2>
          {variantName && <p className="text-[#979797]">{variantName}</p>}
        </div>

        <div className="flex flex-col gap-4 py-4">
          <h3 className="text-[#5F5A5A] page-title">{t("Payment method")}</h3>
          {paymentMethods.map(method => (
            <Button 
              key={method} 
              className={`main-btn ${selectedMethod === method ? '!bg-mainorange' : '!bg-darkgray border border-[#181818]'}`}
              onClick={() => setSelectedMethod(method)}
            >
              {method}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-4 py-4 border-b border-b-[#282828]">
          <div className="flex items-center justify-between page-title">
            <h3>{t("Subtotal")}</h3>
            <p>฿ {price}</p>
          </div>
          <div className="flex items-center justify-between page-title">
            <h3 className="text-[#5F5A5A]">{t("Tax")} (7%)</h3>
            <p className="text-[#979797]">฿ {tax.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between page-title">
          <h3>{t("Total cost")}</h3>
          <p>฿ {totalPrice.toFixed(2)}</p>
        </div>

        <footer className="btn-footer">
          <Button 
            className="main-btn !bg-mainorange"
            disabled={!selectedMethod || isProcessing}
            onClick={handleCreateOrder}
          >
            {isProcessing ? t("Processing...") : t("Make a payment")}
          </Button>

          <p className="text-sm font-medium pt-6">
            เมื่อคลิก 'ชำระเงิน' คุณยินยอมให้ทำการชำระเงินตาม 
            <span className="text-mainorange">นโยบายความเป็นส่วนตัว</span> 
            และ 
            <span className="text-mainorange">เงื่อนไขการให้บริการ </span>
            ของทางร้าน
          </p>

          <Button className="!bg-transparent w-full flex items-center gap-2">
            <QuestionChat />
            {t("Ask for help")}
          </Button>
        </footer>
      </section>

      <Sheet open={showThankYou} onOpenChange={setShowThankYou}>
        <SheetOverlay className="backdrop-blur-sm bg-transparent"/>
        <SheetContent className="h-[40%] !p-0 border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">{t("Thank you!")}</h2>
          <p className="text-center mb-8">{t("Your order has been placed successfully.")}</p>
          <Button 
            className="main-btn !bg-mainorange"
            onClick={() => navigate('/home')}
          >
            {t("Continue Shopping")}
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CheckoutPage;
