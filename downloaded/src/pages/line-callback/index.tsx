import { useEffect } from "react";
import { useLogin, useNavigation } from "@refinedev/core";
import { useLocation } from "react-router-dom";

export const LineCallback = () => {
  const { replace } = useNavigation();
  const location = useLocation();
  const { mutate: login } = useLogin();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      console.error("Line login error:", error);
      replace("/login");
      return;
    }

    if (code) {
      login({
        providerName: "line",
        code,
      });
    } else {
      replace("/login");
    }
  }, [location.search]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl">Logging in...</h1>
        <p>Please wait while we complete your authentication</p>
      </div>
    </div>
  );
};