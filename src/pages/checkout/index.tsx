// src/pages/checkout/index.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/main/Header";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@refinedev/core";
import { QuestionChat, DownloadIcon } from "@/components/icons/MainIcons";
import { supabase } from "@/lib/supabase";
import RegisterDrawer from "@/components/main/RegisterDrawer";
import { useEvents } from "@/hooks/useEvents";
import { useCustomer } from "@/hooks/useCustomer";

const QR_CODE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png';
// Example bank details
const BANK_DETAILS = {
  bankName: "Kasikorn Bank",
  accountName: "Glowfish Co., Ltd",
  accountNumber: "xxx-x-xxxxx-x",
  swiftCode: "KASITHBK"
};

const CheckoutPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { productId, variantId, productName, variantName, price, image } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshEvents } = useEvents();
  const { customer } = useCustomer();

  const totalPrice = price * 1.07;
  const tax = price * 0.07;

  const handleCreateOrder = async () => {
    if (!paymentMethod) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newOrder, error } = await supabase.rpc('place_order', {
        p_store_name: 'glowfish',
        p_customer_id: customer.id,
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
      setShowPaymentDetails(false);
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
          <Button 
            className={`main-btn ${paymentMethod === 'bank_transfer' ? '!bg-mainorange' : '!bg-darkgray border border-[#181818]'}`}
            onClick={() => setPaymentMethod('bank_transfer')}
          >
            {t("Bank Transfer")}
          </Button>
          <Button 
            className={`main-btn ${paymentMethod === 'qr_code' ? '!bg-mainorange' : '!bg-darkgray border border-[#181818]'}`}
            onClick={() => setPaymentMethod('qr_code')}
          >
            {t("QR Code")}
          </Button>
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
            disabled={!paymentMethod || isProcessing}
            onClick={() => setShowPaymentDetails(true)}
          >
            {t("Make a payment")}
          </Button>

          <p className="text-sm font-medium pt-6">
            {t("By clicking 'Make a payment' you agree to our")} 
            <span className="text-mainorange"> {t("Privacy Policy")}</span> 
            {t("and")} 
            <span className="text-mainorange"> {t("Terms of Service")}</span>
          </p>

          <Button className="!bg-transparent w-full flex items-center gap-2">
            <QuestionChat />
            {t("Ask for help")}
          </Button>
        </footer>
      </section>

      {/* Payment Details Drawer */}
      <RegisterDrawer 
        isOpen={showPaymentDetails} 
        setIsOpen={setShowPaymentDetails}
        className="p-5 flex flex-col items-center justify-center"
      >
        <div className="member-card w-full h-auto p-5 flex flex-col items-center gap-6">
          <h2 className="text-2xl font-bold">
            {paymentMethod === 'qr_code' ? t("Scan QR Code") : t("Bank Transfer Details")}
          </h2>

          <div className="w-full text-center mb-4">
            <p className="text-[#979797]">{t("Total Amount")}</p>
            <p className="text-2xl font-bold">฿ {totalPrice.toFixed(2)}</p>
          </div>
          
          {paymentMethod === 'qr_code' ? (
            <>
              <img src={QR_CODE_URL} alt="QR Code" className="w-full max-w-[300px] aspect-square"/>
              <Button 
                onClick={() => {/* Download QR code */}}
                className="!bg-transparent w-full flex items-center justify-center gap-2 text-white"
              >
                <DownloadIcon className="w-6 h-6" />
                {t("Download QR Code")}
              </Button>
            </>
          ) : (
            <div className="w-full space-y-4 text-left">
              <div className="space-y-1">
                <p className="text-[#979797]">{t("Bank Name")}</p>
                <p className="font-semibold">{BANK_DETAILS.bankName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[#979797]">{t("Account Name")}</p>
                <p className="font-semibold">{BANK_DETAILS.accountName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[#979797]">{t("Account Number")}</p>
                <p className="font-semibold">{BANK_DETAILS.accountNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[#979797]">{t("SWIFT Code")}</p>
                <p className="font-semibold">{BANK_DETAILS.swiftCode}</p>
              </div>
            </div>
          )}

          <Button 
            className="main-btn !bg-mainorange w-full"
            onClick={handleCreateOrder}
            disabled={isProcessing}
          >
            {isProcessing ? t("Processing...") : t("Confirm Payment")}
          </Button>
        </div>
      </RegisterDrawer>

      {/* Thank You Drawer */}
      <RegisterDrawer 
        isOpen={showThankYou} 
        setIsOpen={setShowThankYou}
        className="p-5 flex flex-col items-center justify-center"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">{t("Thank you!")}</h2>
          <p>{t("Your order has been placed successfully.")}</p>
          <Button 
            className="main-btn !bg-mainorange"
            onClick={() => navigate('/home')}
          >
            {t("Continue Shopping")}
          </Button>
        </div>
      </RegisterDrawer>
    </>
  );
};

export default CheckoutPage;
