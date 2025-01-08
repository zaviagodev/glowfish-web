import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "@refinedev/react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThaiFlag } from "@/components/icons/MainIcons"
import GetOTPDrawer from "./GetOTPDrawer"
import { useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup";
import { phoneSchema } from "./phoneSchema"
import { useTranslate } from "@refinedev/core"

type PhoneFormProps = {
  initialValues?: {
    phone_verification: undefined | number
  }
}

const PhoneForm = ({
  initialValues = {
    phone_verification: undefined
  }
} : PhoneFormProps) => {

  const t = useTranslate()
  const [verified, setVerified] = useState(false)
  const [phone, setPhone] = useState("")
  const form = useForm({
    resolver: yupResolver(phoneSchema),
    defaultValues: initialValues,
  })

  const handleSubmit = (data: {phone_verification: number}) => {
    setPhone(`+66${data.phone_verification}`);
    setVerified(true);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-y-[30px]">
        <FormField
          control={form.control}
          name="phone_verification"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone_verification">{t("Fill the phone number")}</FormLabel> 
              <div className="flex gap-3">
                <div className="main-input w-fit flex items-center gap-2">
                  <ThaiFlag />
                  <span>+66</span>
                </div>
                <FormControl>
                  <Input placeholder="098-7654321" type="number" className="font-semibold" {...field}/>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-fadewhite text-sm text-center">{t("You will receive the 6-digit code")}</p>

        <Button className="main-btn !bg-[#FF2F00]" type="submit" disabled={!form.formState.isValid}>{t("Get OTP")}</Button>

        <GetOTPDrawer isOpen={verified} setIsOpen={setVerified} phone={phone}/>
      </form>
    </Form>
  )
}

export default PhoneForm