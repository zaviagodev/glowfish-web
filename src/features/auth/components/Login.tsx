import { useTranslate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { loginWithLine } from "@/authProvider";
import { createTestSession } from "@/authProvider";
import LineIcon from "@/components/icons/LineIcon";
import DrawerInfo from "@/components/company-info/DrawerInfo";
import { useConfig } from "@/hooks/useConfig";
import DefaultStorefront from "@/components/icons/DefaultStorefront";

export const Login = () => {
  const t = useTranslate();
  const { config } = useConfig();
  const handleLineLogin = () => {
    loginWithLine();
  };

  const handleTestLogin = async () => {
    await createTestSession();
    // Redirect to home
    window.location.href = "/home";
  };

  return (
    <section className="px-5 py-10 flex flex-col gap-20">
      <div className="flex flex-col gap-10 items-start">
        {config?.storeLogo ? (
          <img
            src={config.storeLogo}
            alt="Store Logo"
            className="max-h-[68px] object-contain"
          />
        ) : (
          <DefaultStorefront />
        )}
        <h1 className="text-[31px] tracking-[0.43px] m-0">
          {t("Sign up to see more interesting things.")}
        </h1>
      </div>
      <div className="flex flex-col gap-5">
        <Button
          className="main-btn relative font-semibold"
          onClick={handleLineLogin}
        >
          <LineIcon
            className="w-7 h-7 absolute left-4 bg-white rounded-md"
            fill="#06c655"
          />
          {t("Continue with Line")}
        </Button>
        <DrawerInfo isLogin={true} />
      </div>
    </section>
  );
};
