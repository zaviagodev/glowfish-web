// src/pages/login/index.tsx
import { useTranslate } from "@refinedev/core";
import { Button } from "../../components/ui/button";
import { loginWithLine } from "../../authProvider";
import { supabase } from "../../lib/supabase";
import { createTestSession } from "../../authProvider";
import GlowfishIcon from "@/components/icons/GlowfishIcon";

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
        <GlowfishIcon className="w-[102px] h-[58px]" />
        <h1 className="text-[31px] tracking-[0.43px] m-0">
          {t("Sign in to see all the event happening.")}
        </h1>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          className="main-btn relative font-semibold"
          onClick={handleLineLogin}
        >
          {/* TODO: add LineIcon className="absolute left-4" */}
          {t("Continue with Line")}
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
