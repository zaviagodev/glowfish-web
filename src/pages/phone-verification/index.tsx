import Header from "@/components/main/Header"
import PhoneForm from "./phoneForm"
import { useTranslate } from "@refinedev/core"

const PhoneVerification = () => {

  const t = useTranslate();

  return (
    <>
      <Header />
      <section className="flex flex-col gap-y-6">
        <div>
          <h2 className="text-[#E0DCDD] font-bold text-xl">{t("Fill the phone number")}</h2>
          <p className="text-fadewhite text-sm">{t("Please fill the phone number to receive OTP")}</p>
        </div>
        <PhoneForm />
      </section>
    </>
  )
}

export default PhoneVerification