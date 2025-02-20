import { useTranslate } from "@refinedev/core";
import { Route, Routes, useLocation } from "react-router-dom";
import { CartPage } from "../features/order/components/CartPage";
import { CheckoutPage } from "../features/order/components/CheckoutPage";
import { PaymentPage } from "../features/order/components/PaymentPage";
import { ThankYouPage } from "../features/order/components/ThankYouPage";
import AddressSelection from "../features/order/components/AddressSelection";

export default function OrderFlow() {
  const location = useLocation();
  const basePath = location.pathname.split('/')[1]; // 'cart', 'checkout', or 'payment'

  return (
    <Routes>
      {basePath === 'cart' && (
        <Route index element={<CartPage />} />
      )}
      
      {basePath === 'checkout' && (
        <Route path="*">
          <Route index element={<CheckoutPage />} />
          <Route path="address" element={<AddressSelection />} />
          <Route path="payment/:orderId" element={<PaymentPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
        </Route>
      )}
      
      {basePath === 'payment' && (
        <Route path=":orderId" element={<PaymentPage />} />
      )}
    </Routes>
  );
} 