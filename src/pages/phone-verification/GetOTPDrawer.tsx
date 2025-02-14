import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useStore } from "@/hooks/useStore";

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
import { otpSchema } from "./phoneSchema";
import { OTPInput } from "@/components/auth/OTPInput";
import { verifyOTP, setSupabaseSession } from "@/lib/auth";

interface OTPFormProps extends RegisterDrawerProps {
  initialValues?: {
    otp: string;
  };
  phone: string;
  verification_token: string;
}

const GetOTPDrawer = ({
  setIsOpen,
  isOpen,
  phone,
  verification_token,
  initialValues = {
    otp: "",
  },
}: OTPFormProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { storeName } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: initialValues,
  });

  const handleVerification = async (data: { otp: string }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const tokenData = await verifyOTP(data.otp, phone, verification_token, storeName);
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
        <form onSubmit={form.handleSubmit(handleVerification)} className="mt-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
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

          <SheetFooter className="pt-8 items-center gap-8">
            <Button
              className="main-btn w-full"
              type="submit"
              disabled={!form.formState.isValid || isSubmitting}
            >
              {isSubmitting ? t("Verifying...") : t("Confirm OTP")}
            </Button>
            <p className="text-muted-foreground text-sm">
              {t("Didn't receive the OTP?")}
              <button
                type="button"
                className="text-mainbutton ml-1 underline"
                onClick={() => {
                  /* Add resend OTP logic */
                }}
              >
                {t("Resend OTP")}
              </button>
            </p>
          </SheetFooter>
        </form>
      </Form>
    </RegisterDrawer>
  );
};

export default GetOTPDrawer;
