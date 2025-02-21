import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { ProfileForm } from "./ProfileForm";

export const ProfileSetup = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  return (
    <div className="max-width-mobile pt-14">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-2xl font-bold">
          {t("Complete Your Profile")}
        </h1>
        <p className="text-muted-foreground">
          {t("Please provide your information to continue")}
        </p>
      </div>
      <div className="p-5">
        <ProfileForm onComplete={() => navigate("/auth/tell-us-about-yourself")} />
      </div>
    </div>
  );
};
