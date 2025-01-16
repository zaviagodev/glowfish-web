import { useEffect, useRef } from "react";
import { useLogin, useNavigation } from "@refinedev/core";
import { useLocation } from "react-router-dom";

export const LineCallback = () => {
  const { replace } = useNavigation();
  const location = useLocation();
  const { mutate: login } = useLogin();
  const loginAttempted = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timeout on unmount
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");

    // Handle error case
    if (error) {
      console.error("Line login error:", error);
      replace("/login");
      return;
    }

    // Only attempt login once and if we have a code
    if (code && !loginAttempted.current) {
      loginAttempted.current = true;

      // Set a timeout to redirect to login if authentication takes too long
      timeoutRef.current = window.setTimeout(() => {
        console.error("Login timeout - redirecting to login page");
        replace("/login");
      }, 30000); // 30 seconds timeout

      // Attempt login
      login({
        providerName: "line",
        code,
      });
    }
  }, [location.search, login, replace]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl">Logging in...</h1>
        <p>Please wait while we complete your authentication</p>
      </div>
    </div>
  );
};