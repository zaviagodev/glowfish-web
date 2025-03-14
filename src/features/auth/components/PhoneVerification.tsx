import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";
import { PhoneForm } from "./PhoneForm";

export const PhoneVerification = () => {
  const t = useTranslate();

  return (
    <>
      <Header />
      <section className="flex flex-col gap-y-6 p-5 mt-14">
        <div>
          <h2 className="text-primary font-bold text-xl">
            {t("Fill the phone number")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("Please fill the phone number to receive OTP")}
          </p>
        </div>
        <PhoneForm />
      </section>
    </>
  );
}; 