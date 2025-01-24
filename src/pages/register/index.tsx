import RegisterForm from "./registerForm";
import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";

export const Register = () => {
  const t = useTranslate();

  return (
    <>
      <Header />
      <section className="flex flex-col gap-6 main-container">
        <div className="flex flex-col gap-6">
          {/* TODO: add ProfileIcon */}
          ProfileIcon
          <h2 className="main-heading">
            {t(
              "Become a part of Good Afterwork Community and see the latest event"
            )}
          </h2>
        </div>
        <RegisterForm />
      </section>
    </>
  );
};
