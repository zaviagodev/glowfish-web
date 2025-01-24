// src/pages/login/index.tsx
import { useTranslate } from "@refinedev/core";
import { Button } from "../../components/ui/button";
import { loginWithLine } from "../../authProvider";
import { supabase } from "../../lib/supabase";
import { createTestSession } from "../../authProvider";

export const Login = () => {
  const t = useTranslate();

  const handleLineLogin = () => {
    loginWithLine();
  };

  const handleTestLogin = async () => {
    await createTestSession();
    // Redirect to home
    window.location.href = "/home";
  };

  return (
    <section className="p-5 flex flex-col gap-20">
      <div className="flex flex-col gap-10">
        {/* TODO: add GlowfishIcon */}
        GlowfishIcon
        <h1 className="text-3xl m-0">
          {t("Sign in to see all the event happening.")}
        </h1>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          className="main-btn !bg-line text-background relative font-semibold"
          onClick={handleLineLogin}
        >
          {/* TODO: add LineIcon className="absolute left-4" */}
          {t("Continue with Line")}
        </Button>

        <Button
          className="main-btn !bg-gray-600 text-white relative font-semibold mt-2"
          onClick={handleTestLogin}
        >
          {t("Test Login")}
        </Button>

        <p className="text-center font-light text-xs">
          {t(
            "By proceeding, you agree to our terms of use and Confirm you have read our Privacy and Cookie statement."
          )}
        </p>
      </div>
    </section>
  );
};
