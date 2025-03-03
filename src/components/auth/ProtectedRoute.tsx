import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router-v6";
import { Outlet } from "react-router-dom";
import { useProfileSetup } from "@/hooks/useProfileSetup";

export const ProtectedRoute = () => {
  // Use the profile setup hook to check completion status
  useProfileSetup();

  return (
    <Authenticated
      key="authenticated-routes"
      fallback={<CatchAllNavigate to="/auth/login" />}
    >
      <Outlet />
    </Authenticated>
  );
}; 