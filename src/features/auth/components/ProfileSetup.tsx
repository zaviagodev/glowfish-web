import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { ProfileForm } from "./ProfileForm";

export const ProfileSetup = () => {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto pt-14 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#E0DCDD] mb-2">
          {t("Complete Your Profile")}
        </h1>
        <p className="text-muted-foreground">
          {t("Please provide your information to continue")}
        </p>
      </div>
      
      <div className="bg-tertiary rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <ProfileForm onComplete={() => navigate("/auth/tell-us-about-yourself")} />
        </div>
      </div>
    </div>
  );
}; 