import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import BottomNav from "../navigation/BottomNav";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();

  const containerClass = 
    location.pathname === "/home" ||
    location.pathname === "/rewards" ? "main-container-home" : 
    location.pathname.includes("/home/show") || 
    location.pathname.includes("/rewards/detail") ? "" :
    "main-container";

  const showBottomNav = !["/login", "/register", "/phone-verification", "/tell-us-about-yourself"].includes(location.pathname);

  return (
    <>
      <div className={cn(containerClass, showBottomNav && "pb-[70px]")}>
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </>
  );
};