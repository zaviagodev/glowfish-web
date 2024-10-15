import RegisterDrawer from "@/components/main/RegisterDrawer"
import { Button } from "@/components/ui/button"
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { RegisterDrawerProps } from "@/type/type"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "@refinedev/react-hook-form"
import { OTPInput, SlotProps } from 'input-otp'
import { useNavigate } from "react-router-dom"
import { otpSchema } from "./phoneSchema"
import { useTranslate } from "@refinedev/core"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface OTPFormProps extends RegisterDrawerProps {
  initialValues?: {
    otp: string
  }
}

const GetOTPDrawer = ({ 
  setIsOpen,
  isOpen,
  initialValues = {
    otp: ''
  }
} : OTPFormProps) => {

  const t = useTranslate();
  const form = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: initialValues
  })

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
        <SheetTitle className="text-[#E0DCDD]">{t("Please fill the OTP")}</SheetTitle>
        <SheetDescription className="text-fadewhite">
          {t("Your OTP will be sent to your phone number")}
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => data)} className="mt-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="otp" className="page-title">{t("Fill the OTP")}</FormLabel> 
              <FormControl>
                <OTPInput
                  type="number"
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
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SheetFooter className="pt-8 items-center gap-8">
          <Button className="main-btn !bg-[#EC441E]" type="submit" disabled={!form.formState.isValid} onClick={() => navigate('/tell-us-about-yourself')}>{t("Confirm OTP")}</Button>

          <p>{t("Didn't receive the OTP")} <a className="text-[#EC441E]">{t("Resend OTP")}</a></p>
        </SheetFooter>
        </form>
      </Form>
    </RegisterDrawer>
  )
}

export default GetOTPDrawer