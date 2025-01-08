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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { supabase } from "@/lib/supabase"

interface OTPFormProps extends RegisterDrawerProps {
  initialValues?: {
    otp: string
  },
  phone: string
}

const GetOTPDrawer = ({ 
  setIsOpen,
  isOpen,
  phone,
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
   
  function FakeCaret() {
    return (
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
        <div className="w-px h-8 bg-background" />
      </div>
    )
  }
   
  function FakeDash() {
    return (
      <div className="flex w-10 justify-center items-center">
        <div className="w-3 h-1 rounded-full bg-border" />
      </div>
    )
  }

  const handleVerification = async (data: {otp: string}) => {
    if (data.otp === "111111") {
      try {
        const token = localStorage.getItem("refine-auth");
        const lineUser = JSON.parse(localStorage.getItem("line-user") || "{}");
      
        const { data: verifyData, error } = await supabase.functions.invoke('verify-otp', {
          body: {
            otp: data.otp,
            phone,
            line_id: lineUser.userId,
            access_token: token,
          },
        });
        if (error) throw error;
      
        const authResponse = await supabase.auth.verifyOtp({
          email: verifyData.email,
          token: verifyData.token,
          type: 'email',
        });
      
        // Set session in Supabase client
        if (authResponse?.access_token) {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: authResponse.access_token,
            refresh_token: authResponse.refresh_token,
          });
          if (setSessionError) throw setSessionError;
        }
      
        navigate('/tell-us-about-yourself');
      } catch (error) {
        console.error("Verification error:", error);
      }
    }
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
        <form onSubmit={form.handleSubmit(handleVerification)} className="mt-6">
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
            <Button className="main-btn !bg-mainorange" type="submit" disabled={!form.formState.isValid}>{t("Confirm OTP")}</Button>
            <p>{t("Didn't receive the OTP")} <a className="text-mainorange">{t("Resend OTP")}</a></p>
          </SheetFooter>
        </form>
      </Form>
    </RegisterDrawer>
  )
}

export default GetOTPDrawer