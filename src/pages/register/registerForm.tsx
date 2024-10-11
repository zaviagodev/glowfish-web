import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { registerSchema } from "./registerSchema"
import { useForm } from "@refinedev/react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"

const RegisterForm = () => {

  const form = useForm({
    // resolver: yupResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    },
  })

  const navigate = useNavigate()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => data)} className="space-y-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="first_name">What should we call you?</FormLabel> 
              <FormControl>
                <Input placeholder="First name" {...field} className="font-sfpro-rounded font-semibold"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="last_name">What is your last name</FormLabel> 
              <FormControl>
                <Input placeholder="Last name" {...field} className="font-sfpro-rounded font-semibold"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone">Phone</FormLabel> 
              <FormControl>
                <Input placeholder="Phone" {...field} className="font-sfpro-rounded font-semibold"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel> 
              <FormControl>
                <Input placeholder="Email" {...field} className="font-sfpro-rounded font-semibold"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          className="main-btn !bg-[#F3EBD7] text-black"
          type="submit"
          onClick={() => navigate('/phone-verification')}
        >
          Next
        </Button>
      </form>
    </Form>
  )
}

export default RegisterForm