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
      
      <div className="max-w-2xl mx-auto pt-14 px-4 sm:px-6 lg:px-8">
        <div className="bg-tertiary rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <ProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 