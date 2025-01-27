import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "@refinedev/react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GetOTPDrawer from "./GetOTPDrawer";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { phoneSchema } from "./phoneSchema";
import { useTranslate } from "@refinedev/core";
import { supabase } from "@/lib/supabase";
import { Languages } from "lucide-react";

type PhoneFormProps = {
  initialValues?: {
    phone_verification: undefined | number;
  };
};

const PhoneForm = ({
  initialValues = {
    phone_verification: undefined,
  },
}: PhoneFormProps) => {
  const t = useTranslate();
  const [verified, setVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const form = useForm({
    resolver: yupResolver(phoneSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = async (data: { phone_verification: number }) => {
    const phoneNumber = `+66${data.phone_verification}`;
    setPhone(phoneNumber);

    try {
      const { data: otpData, error } = await supabase.functions.invoke(
        "send-otp",
        {
          body: { phone: phoneNumber },
        }
      );

      if (error) throw error;

      // Store verification token
      if (otpData?.token) {
        setVerificationToken(otpData.token);
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
                  <div className="main-input w-fit flex items-center gap-2">
                    <Languages />
                    <span>+66</span>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="098-7654321"
                      type="number"
                      className="font-semibold"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-fadewhite text-sm text-center">
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
        verification_token={verificationToken}
      />
    </>
  );
};

export default PhoneForm;
