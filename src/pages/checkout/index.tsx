import { QuestionChat } from "@/components/icons/MainIcons"
import Header from "@/components/main/Header"
import { Button } from "@/components/ui/button"
import jameson from "@/img/jameson-live-music.svg"
import { useTranslate } from "@refinedev/core"
import { ChevronDown } from "lucide-react"

const CheckoutPage = () => {

  const t = useTranslate();
  const paymentMethods = ["QR Code", "Bank account"];

  return (
    <>
      <Header title="Checkout" rightButton="Detail"/>

      <section className="flex flex-col gap-6 mb-[200px]">
        <img src={jameson} className="rounded-xl"/>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[#979797] flex items-center gap-1">Grand total 1 item <ChevronDown className="h-4 w-4"/></p>
          <h1 className="text-[39px] font-semibold m-0">฿0.00</h1>
        </div>

        <div className="flex flex-col gap-4 py-4">
          <h3 className="text-[#5F5A5A] page-title">{t("Payment method")}</h3>
          {paymentMethods.map(method => (
            <Button className="main-btn !bg-darkgray border border-[#181818]">{method}</Button>
          ))}
        </div>

        <div className="flex flex-col gap-4 py-4 border-b border-b-[#282828]">
          <div className="flex items-center justify-between page-title">
            <h3>{t("Subtotal")}</h3>
            <p>฿ 0.00</p>
          </div>
          <div className="flex items-center justify-between page-title">
            <h3 className="text-[#5F5A5A]">{t("Shipping cost")}</h3>
            <p className="text-[#979797]">฿ 0.00</p>
          </div>
          <div className="flex items-center justify-between page-title">
            <h3 className="text-[#5F5A5A]">{t("Tax")} (7%)</h3>
            <p className="text-[#979797]">฿ 0.00</p>
          </div>
        </div>

        <div className="flex items-center justify-between page-title">
          <h3>{t("Total cost")}</h3>
          <p>฿ 0.00</p>
        </div>

        <footer className="btn-footer">
          <Button className="main-btn !bg-mainorange">{t("Make a payment")}</Button>

          <p className="text-sm font-medium pt-6">เมื่อคลิก 'ชำระเงิน' คุณยินยอมให้ทำการชำระเงินตาม 
            <span className="text-mainorange">นโยบายความเป็นส่วนตัว</span> 
            และ 
            <span className="text-mainorange">เงื่อนไขการให้บริการ </span>
            ของทางร้าน
          </p>

          <Button className="!bg-transparent w-full flex items-center gap-2">
            <QuestionChat />
            {t("Ask for help")}
          </Button>
        </footer>
      </section>
    </>
  )
}

export default CheckoutPage