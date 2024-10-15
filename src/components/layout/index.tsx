import type { PropsWithChildren } from "react";
import { Breadcrumb } from "../breadcrumb";
import { Menu } from "../menu";
import { useLocation } from "react-router-dom";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {

  const location = useLocation()

  const containerClass = 
    location.pathname === "/home" ||
    location.pathname === "/rewards" ? "main-container-home" : 
    location.pathname.includes("/home/show") || 
    location.pathname.includes("/rewards/detail") ? "" :
    "main-container"

  return (
    <div className={containerClass}>
      {/* <Menu />
      <div className="content">
        <Breadcrumb />
        <div>{children}</div>
      </div> */}
      {children}
    </div>
  );
};
