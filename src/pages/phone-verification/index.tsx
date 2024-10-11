import { ThaiFlag } from "@/components/icons/MainIcons"
import Header from "@/components/main/Header"
import { Input } from "@/components/ui/input"
import PhoneForm from "./phoneForm"

const PhoneVerification = () => {
  return (
    <>
      <Header navigateBackTo="/register"/>
      <section className="flex flex-col gap-y-6">
        <div>
          <h2 className="text-[#E0DCDD] font-bold text-xl">กรอกหมายเลขโทรศัพท์</h2>
          <p className="text-fadewhite text-sm">กรุณากรอกหมายเลขโทรศัพท์ของคุณเพื่อรับรหัส OTP</p>
        </div>
        
        <PhoneForm />
      </section>
    </>
  )
}

export default PhoneVerification