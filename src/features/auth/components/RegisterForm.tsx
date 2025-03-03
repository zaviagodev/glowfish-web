import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "../schemas/registerSchema";
import type { RegisterSchema } from "../schemas/registerSchema";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/hooks/useStore";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const RegisterForm = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setUser = useStore((state) => state.setUser);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: t("Error"),
          description: error.message,
        });
        return;
      }

      if (authData.user) {
        // Create customer record
        const { error: customerError } = await supabase
          .from("customers")
          .insert({
            id: authData.user.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
          });

        if (customerError) {
          toast({
            variant: "destructive",
            title: t("Error"),
            description: customerError.message,
          });
          return;
        }

        setUser(authData.user);
        toast({
          title: t("Success"),
          description: t("Registration successful"),
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 md:space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-card-foreground"
            >
              {t("First Name")}
            </label>
            <Input
              id="firstName"
              type="text"
              {...form.register("firstName")}
              className="bg-darkgray"
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-card-foreground"
            >
              {t("Last Name")}
            </label>
            <Input
              id="lastName"
              type="text"
              {...form.register("lastName")}
              className="bg-darkgray"
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-card-foreground"
          >
            {t("Email")}
          </label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="bg-darkgray"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-card-foreground"
          >
            {t("Password")}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
              className="bg-darkgray pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-card-foreground"
          >
            {t("Confirm Password")}
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...form.register("confirmPassword")}
              className="bg-darkgray pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full">
          {t("Register")}
        </Button>
      </form>
    </Form>
  );
}; 