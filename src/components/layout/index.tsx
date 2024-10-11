import type { PropsWithChildren } from "react";
import { Breadcrumb } from "../breadcrumb";
import { Menu } from "../menu";
import { useLocation } from "react-router-dom";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {

  const location = useLocation()

  const containerClass = 
    location.pathname === "/home" ? "main-container-home" : "main-container"

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
