import Header from "@/components/main/Header"
import RegisterDrawer from "@/components/main/RegisterDrawer"
import { Button } from "@/components/ui/Button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { RegisterDrawerProps } from "@/type/type"
import { OTPInput, SlotProps } from 'input-otp'
import { useNavigate } from "react-router-dom"

const GetOTPDrawer = ({ 
  setIsOpen,
  isOpen
} : RegisterDrawerProps) => {

  const navigate = useNavigate()

  function Slot(props: SlotProps) {
    return (
      <div
        className={cn(
          'relative w-12 h-16 text-[2rem]',
          'flex items-center justify-center',
          'border-input border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
          { 'outline outline-1 outline-orangefocus': props.isActive },
        )}
      >
        {props.char !== null && <div className="font-sfpro-rounded">{props.char}</div>}
        {props.hasFakeCaret && <FakeCaret />}
      </div>
    )
  }
   
  // You can emulate a fake textbox caret!
  function FakeCaret() {
    return (
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
        <div className="w-px h-8 bg-background" />
      </div>
    )
  }
   
  // Inspired by Stripe's MFA input.
  function FakeDash() {
    return (
      <div className="flex w-10 justify-center items-center">
        <div className="w-3 h-1 rounded-full bg-border" />
      </div>
    )
  }

  return (
    <RegisterDrawer isOpen={isOpen} setIsOpen={setIsOpen} className="p-5">
      <SheetHeader className="text-left">
        <SheetTitle className="text-[#E0DCDD]">กรอกรหัสผ่าน OTP</SheetTitle>
        <SheetDescription className="text-fadewhite">
          รหัส OTP จะส่งไปยังหมายเลขโทรศัพท์ของคุณ
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-2">
        <label htmlFor="otp">กรอกรหัส OTP</label>
        <OTPInput
          id="otp"
          maxLength={6}
          containerClassName="group flex items-center justify-center has-[:disabled]:opacity-30"
          render={({ slots }) => (
            <>
              <div className="flex">
                {slots.slice(0, 3).map((slot, idx) => (
                  <Slot key={idx} {...slot} />
                ))}
              </div>
        
              <FakeDash />
        
              <div className="flex">
                {slots.slice(3).map((slot, idx) => (
                  <Slot key={idx} {...slot} />
                ))}
              </div>
            </>
          )}
        />
      </div>

      <SheetFooter className="pt-8 items-center gap-8">
        <Button className="main-btn !bg-[#EC441E]" onClick={() => navigate('/tell-us-about-yourself')}>Confirm OTP</Button>

        <p>ไม่ได้รับรหัส <a className="text-[#EC441E]">ขอ OTP อีกครั้ง</a></p>
      </SheetFooter>
    </RegisterDrawer>
  )
}

export default GetOTPDrawer