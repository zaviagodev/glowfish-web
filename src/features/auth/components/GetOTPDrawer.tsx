import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useStore } from "@/hooks/useStore";
import { supabase } from "@/lib/supabase";

import RegisterDrawer from "@/components/main/RegisterDrawer";
import { Button } from "@/components/ui/button";
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { RegisterDrawerProps } from "@/type/type";
import { otpSchema } from "../schemas/phoneSchema";
import { OTPInput } from "@/components/auth/OTPInput";
import { verifyOTP, setSupabaseSession } from "@/lib/auth";

interface OTPFormProps extends RegisterDrawerProps {
  initialValues?: {
    otp: string;
  };
  phone: string;
  ref_no: string;
  verification_token: string;
}

export const GetOTPDrawer = ({
  setIsOpen,
  isOpen,
  phone,
  ref_no,
  verification_token: initialVerificationToken,
  initialValues = {
    otp: "",
  },
}: OTPFormProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { storeName } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [currentVerificationToken, setCurrentVerificationToken] = useState(initialVerificationToken);

  useEffect(() => {
    setCurrentVerificationToken(initialVerificationToken);
  }, [initialVerificationToken]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown, isResendDisabled]);

  const form = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: initialValues,
  });

  const handleVerification = async (data: { otp: string }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const tokenData = await verifyOTP(data.otp, phone, currentVerificationToken, storeName);
      if (!tokenData.success) {
        throw new Error(tokenData.error || "Verification failed");
      }

      navigate("/tell-us-about-yourself");
    } catch (error) {
      console.error("Verification error:", error);
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResendDisabled(true);
      setCountdown(60);
      setError(null);

      const { data: otpData, error } = await supabase.functions.invoke(
        "send-otp",
        {
          body: { phone, ref_code:ref_no },
        }
      );

      if (error) throw error;
      
      if (otpData?.token) {
        setCurrentVerificationToken(otpData.token);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError(error instanceof Error ? error.message : "Failed to resend OTP");
      setIsResendDisabled(false);
    }
  };

  return (
    <RegisterDrawer isOpen={isOpen} setIsOpen={setIsOpen} className="p-5">
      <SheetHeader className="text-left">
        <SheetTitle className="text-[#E0DCDD]">
          {t("Please fill the OTP")}
        </SheetTitle>
        <SheetDescription className="text-muted-foreground">
          {t("Your OTP will be sent to your phone number")}
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleVerification)} className="mt-6 flex flex-col items-center">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="otp" className="text-muted-foreground">
                  {t("Fill the OTP")}
                </FormLabel>
                <FormControl>
                  <OTPInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p className="text-red-500 text-sm mt-2 font-semibold">{error}</p>
          )}

          <div className="flex flex-col items-center w-full gap-8 mt-8">
            <Button
              className="main-btn w-full max-w-[300px]"
              type="submit"
              disabled={!form.formState.isValid || isSubmitting}
            >
              {isSubmitting ? t("Verifying...") : t("Confirm OTP")}
            </Button>
                    
            <div className="flex flex-col items-center justify-center w-full">
              <p className="text-muted-foreground text-sm text-center">
                {t("Didn't receive the OTP?")}
                <button
                  type="button"
                  className={`ml-1 ${isResendDisabled ? 'text-gray-500' : 'text-mainbutton underline'}`}
                  onClick={handleResendOTP}
                  disabled={isResendDisabled}
                >
                  {isResendDisabled 
                    ? `${t("Resend OTP")} (${countdown}s)`
                    : t("Resend OTP")}
                </button>
              </p>
            </div>
          </div>
        </form>
      </Form>
    </RegisterDrawer>
  );
}; 