import type { PropsWithChildren } from "react";
import { Breadcrumb } from "../breadcrumb";
import { Menu } from "../menu";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="main-container">
      {/* <Menu />
      <div className="content">
        <Breadcrumb />
        <div>{children}</div>
      </div> */}
      {children}
    </div>
  );
};
