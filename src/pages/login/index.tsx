import { useTranslate } from "@refinedev/core";
import GlowfishIcon from "../../components/icons/GlowfishIcon";
import { Button } from "../../components/ui/button";
import LineIcon from "../../components/icons/LineIcon";
import { useNavigate } from "react-router-dom";

export const Login = () => {

  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <section className="p-5 flex flex-col gap-20">
      <div className="flex flex-col gap-10">
        <GlowfishIcon />
        <h1 className="text-3xl m-0">
          {t("Sign in to see all the event happening.")}
        </h1>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* TODO: Connect with line, Temporarily redirect to '/register' */}
        <Button className="main-btn !bg-line text-background relative font-semibold" onClick={() => navigate("/register")}>
          <LineIcon className="absolute left-4"/>
          {t("Continue with Line")}
        </Button>

        <p className="text-center font-light text-xs">
          {t("By proceeding, you agree to our terms of use and Confirm  you have read our Privacy and Cookie statement.")}
        </p>
      </div>
    </section>
  );
};
