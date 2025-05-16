import { Route, Routes } from "react-router-dom";
import { Login } from "@/features/auth/components/Login";
import { LineCallback } from "@/features/auth/components/LineCallback";
import { PhoneVerification } from "@/features/auth/components/PhoneVerification";
import { TellUsAboutYourself } from "@/features/auth/components/TellUsAboutYourself";
import { ProfileSetup } from "@/features/auth/components/ProfileSetup";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const AuthPage = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="line-callback" element={<LineCallback />} />
      <Route path="phone-verification" element={<PhoneVerification />} />
      <Route element={<ProtectedRoute />}>
        <Route path="profile-setup" element={<ProfileSetup />} />
        <Route path="tell-us-about-yourself" element={<TellUsAboutYourself />} />
      </Route>
    </Routes>
  );
};
