import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema } from "./registerSchema";
import { useForm } from "@refinedev/react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@refinedev/core";
import { yupResolver } from "@hookform/resolvers/yup";

type RegisterFormProps = {
  initialValues?: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
};

const RegisterForm = ({
  initialValues = {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  },
}: RegisterFormProps) => {
  const t = useTranslate();
  const form = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: initialValues,
  });

  const navigate = useNavigate();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => data)} className="space-y-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="first_name" className="text-muted-foreground">
                {t("What should we call you?")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("First name")}
                  {...field}
                  className="font-sfpro-rounded font-semibold main-input"
                />
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
              <FormLabel htmlFor="last_name" className="text-muted-foreground">
                {t("What is your last name")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Last name")}
                  {...field}
                  className="font-sfpro-rounded font-semibold main-input"
                />
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
              <FormLabel htmlFor="phone" className="text-muted-foreground">
                {t("Phone")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Phone")}
                  {...field}
                  className="font-sfpro-rounded font-semibold main-input"
                />
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
              <FormLabel htmlFor="email" className="text-muted-foreground">
                {t("Email")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Email")}
                  {...field}
                  className="font-sfpro-rounded font-semibold main-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="main-btn w-full"
          type="submit"
          onClick={() => navigate("/phone-verification")}
        >
          {t("Next")}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
