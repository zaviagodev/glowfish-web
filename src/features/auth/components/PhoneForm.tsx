import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "@refinedev/react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GetOTPDrawer } from "./GetOTPDrawer";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { phoneSchema } from "../schemas/phoneSchema";
import { useTranslate } from "@refinedev/core";
import { supabase } from "@/lib/supabase";

type PhoneFormValues = {
  phone_verification: string;
};

type PhoneFormProps = {
  initialValues?: PhoneFormValues;
};

export const PhoneForm = ({
  initialValues = {
    phone_verification: "",
  },
}: PhoneFormProps) => {
  const t = useTranslate();
  const [verified, setVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [refNo, setRefNo] = useState("");
  
  const form = useForm<PhoneFormValues>({
    resolver: yupResolver(phoneSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleSubmit: SubmitHandler<PhoneFormValues> = async (data) => {
    // Remove leading zero and add +66 prefix
    const phoneWithoutZero = data.phone_verification.substring(1);
    const phoneNumber = `+66${phoneWithoutZero}`;
    setPhone(phoneNumber);

    try {
      const { data: otpData, error } = await supabase.functions.invoke(
        "send-otp",
        {
          body: { phone: phoneNumber },
        }
      );

      if (error) throw error;

      // Store verification token and ref_no
      if (otpData?.token) {
        setVerificationToken(otpData.token);
      }

      if (otpData?.ref_code) {
        setRefNo(otpData.ref_code);
      }

      // Show OTP input
      setVerified(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      // Handle error appropriately
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-y-[30px]"
        >
          <FormField
            control={form.control}
            name="phone_verification"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="phone_verification"
                  className="text-muted-foreground"
                >
                  {t("Fill the phone number")}
                </FormLabel>
                <div className="flex gap-3">
                  <div className="main-input bg-darkgray w-fit flex items-center gap-2">
                    {/* Thai Flag */}
                    <div className="overflow-hidden h-6 w-6 rounded-full">
                      <span className="block h-1 w-10 bg-[#BB1C37]"></span>
                      <span className="block h-1 w-10 bg-[#FFFFFF]"></span>
                      <span className="block h-2 w-10 bg-[#2D2A4A]"></span>
                      <span className="block h-1 w-10 bg-[#FFFFFF]"></span>
                      <span className="block h-1 w-10 bg-[#BB1C37]"></span>
                    </div>
                    <span>TH</span>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="09X-XXX-XXXX"
                      type="tel"
                      className="font-semibold"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-muted-foreground text-sm text-center">
            {t("You will receive the 6-digit code")}
          </p>

          <Button
            className="main-btn"
            type="submit"
            disabled={!form.formState.isValid}
          >
            {t("Get OTP")}
          </Button>
        </form>
      </Form>

      <GetOTPDrawer
        isOpen={verified}
        setIsOpen={setVerified}
        phone={phone}
        ref_no={refNo}
        verification_token={verificationToken}
      />
    </>
  );
}; 