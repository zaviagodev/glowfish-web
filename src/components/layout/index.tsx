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
      : location.pathname.includes("/home/show") ||
        location.pathname.includes("/rewards/detail") ||
        location.pathname === "/cart"
      ? ""
      : "main-container";

  const showBottomNav = ![
    "/login",
    "/register",
    "/phone-verification",
    "/tell-us-about-yourself",
    "/cart",
    "/checkout",
    "/payment",
  ].some((path) => location.pathname.startsWith(path));

  return (
    <div className="mobile-container">
      <AnimatePresence mode="wait">
        <div className={cn(containerClass, showBottomNav && "pb-[60px]")}>
          {children}
        </div>
      </AnimatePresence>
      {showBottomNav && !location.pathname.startsWith("/my-orders/") && (
        <BottomNav />
      )}
    </div>
  );
};
