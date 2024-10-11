import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "@refinedev/react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/Button"
import { ThaiFlag } from "@/components/icons/MainIcons"
import GetOTPDrawer from "./GetOTPDrawer"
import { useState } from "react"

const PhoneForm = () => {

  const [verified, setVerified] = useState(false)
  const form = useForm({
    // resolver: yupResolver(registerSchema),
    defaultValues: {
      phone_verification: ""
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => data)} className="flex flex-col gap-y-[30px]">
        <FormField
          control={form.control}
          name="phone_verification"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone_verification">กรอกหมายเลขโทรศัพท์</FormLabel> 
              <div className="flex gap-3">
                <div className="main-input w-fit flex items-center gap-2">
                  <ThaiFlag />
                  <span>+66</span>
                </div>
                <FormControl>
                  <Input placeholder="098-7654321" type="tel" className="font-semibold" {...field}/>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-fadewhite text-sm text-center">คุณจะได้รับรหัสยืนยันจำนวน 6 หลัก</p>

        <Button className="main-btn !bg-[#FF2F00]" type="submit" onClick={() => setVerified(true)}>Get OTP</Button>

        <GetOTPDrawer isOTPVerified={verified} setIsOTPVerified={setVerified}/>
      </form>
    </Form>
  )
}

export default PhoneForm