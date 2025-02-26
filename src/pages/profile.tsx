import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForm } from "@/features/auth/components/ProfileForm";

const ProfilePage = () => {
  const t = useTranslate();
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      <PageHeader title={t("Profile")} onBack={() => navigate("/settings")} />
      <div className="max-width-mobile pt-20 px-5">
        <ProfileForm mode="edit" />
      </div>
    </div>
  );
};

export default ProfilePage;
