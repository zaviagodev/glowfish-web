import RegisterForm from "./registerForm";
import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";

export const Register = () => {
  const t = useTranslate();

  return (
    <div className="pt-14">
      <Header />
      <section className="flex flex-col gap-6 main-container p-5">
        <div className="flex flex-col gap-6">
          <div className="w-20 h-20 rounded-3xl border-2 border-[#F5853B]"></div>
          <h2 className="main-heading">
            {t(
              "Become a part of Good Afterwork Community and see the latest event"
            )}
          </h2>
        </div>
        <RegisterForm />
      </section>
    </div>
  );
};
