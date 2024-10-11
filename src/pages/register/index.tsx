import ProfileIcon from "@/components/icons/ProfileIcon";
import { AuthPage } from "@refinedev/core";
import RegisterForm from "./registerForm";
import Header from "@/components/main/Header";

export const Register = () => {
  return (
    <>
      <Header navigateBackTo="/login"/>
      <section className="flex flex-col gap-6 main-container">
        <div className="flex flex-col gap-6">
          <ProfileIcon />
          <h2 className="main-heading">Become a part of Good Afterwork Community and see the latest event</h2>
        </div>

        <RegisterForm />
        {/* <AuthPage type="register" /> */}
      </section>
    </>
  )
};
