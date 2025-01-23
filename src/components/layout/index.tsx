import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import BottomNav from "../navigation/BottomNav";
import { AnimatePresence } from "framer-motion";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();

  const containerClass = 
    location.pathname === "/home" || location.pathname === "/rewards" 
      ? "main-container-home" 
      : location.pathname.includes("/home/show") || location.pathname.includes("/rewards/detail") || location.pathname === "/cart" 
        ? "" 
        : "main-container";

  const showBottomNav = ![
    "/login", 
    "/register", 
    "/phone-verification", 
    "/tell-us-about-yourself", 
    "/cart",
    "/checkout",
    "/checkout/coupons",
    "/checkout/points",
    "/checkout/address",
    "/checkout/vat-invoice",
    "/checkout/payment",
    "/checkout/thank-you",
    "/checkout/summary",
    "/my-orders/1",
    "/my-orders/2",
    "/my-orders/3",
    "/tickets/1",
    "/tickets/2",
    "/tickets/3",
    "/tickets/4"
  ].includes(location.pathname);

  return (
    <div className="mobile-container">
      <AnimatePresence mode="wait">
        <div className={cn(containerClass, showBottomNav && "pb-[49px]")}>
          {children}
        </div>
      </AnimatePresence>
      {showBottomNav && !location.pathname.startsWith('/my-orders/') && <BottomNav />}
    </div>
  );
};