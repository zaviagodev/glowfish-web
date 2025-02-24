import Header from "@/components/main/Header";
import { useNavigate } from "react-router-dom";
import { ProfileForm } from "./ProfileForm";

export const ProfileSetup = () => {
  const navigate = useNavigate();
  return (
    <div className="max-width-mobile pt-14">
      <Header />
      <div className="p-5">
        <ProfileForm onComplete={() => navigate("/auth/tell-us-about-yourself")} />
      </div>
    </div>
  );
};
