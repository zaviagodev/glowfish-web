import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/hooks/useStore";
import { useState, useEffect } from "react";
import { profileSchema } from "../schemas/profileSchema";
import type { ProfileSchema } from "../schemas/profileSchema";
import { useCustomer } from "@/hooks/useCustomer";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProfileFormProps {
  onComplete?: () => void;
}

export const ProfileForm = ({ onComplete }: ProfileFormProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { storeName } = useStore();
  const { customer, refreshCustomer } = useCustomer();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      dateOfBirth: undefined,
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        firstName: customer.first_name || "",
        lastName: customer.last_name || "",
        email: customer.email || "",
        company: customer.company || "",
        dateOfBirth: customer.date_of_birth ? new Date(customer.date_of_birth) : undefined,
      });
      setAvatarUrl(customer.avatar_url || "");
    }
  }, [customer]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split(".").pop();
      const filePath = `${storeName}/customers/avatars/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${publicUrl}?t=${timestamp}`;

      const { error: updateError } = await supabase
        .from("customers")
        .update({ avatar_url: urlWithTimestamp })
        .eq("auth_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(urlWithTimestamp);
      await refreshCustomer();
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setError(error.message || "Failed to upload avatar");
      addToast(error.message || "Failed to upload avatar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileSchema) => {
    try {
      setIsLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.auth.updateUser({
        email: data.email,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      });

      if (error) throw error;

      // Update customer record
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
          date_of_birth: data.dateOfBirth?.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("auth_id", user.id);

      if (customerError) throw customerError;

      await refreshCustomer();
      addToast(t("Profile updated successfully"), "success");
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
      addToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>
              {form.getValues("firstName")?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              accept="image/*"
              id="avatar"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isLoading}
            />
            <label
              htmlFor="avatar"
              className="text-primary cursor-pointer text-sm hover:text-primary/90"
            >
              {t("Change Profile Picture")}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-card-foreground"
            >
              {t("First Name")}
            </label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              disabled={isLoading}
              className="mt-1 bg-darkgray"
            />
            {form.formState.errors.firstName && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-card-foreground"
            >
              {t("Last Name")}
            </label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              disabled={isLoading}
              className="mt-1 bg-darkgray"
            />
            {form.formState.errors.lastName && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>

          <div>
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
              disabled={isLoading}
              className="mt-1 bg-darkgray"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-card-foreground"
            >
              {t("Company")}
            </label>
            <Input
              id="company"
              {...form.register("company")}
              disabled={isLoading}
              className="mt-1 bg-darkgray"
            />
            {form.formState.errors.company && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.company.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-card-foreground"
            >
              {t("Date of Birth")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateOfBirth"
                  disabled={isLoading}
                  className={cn(
                    "w-full mt-1 justify-start text-left font-normal bg-darkgray",
                    !form.getValues("dateOfBirth") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.getValues("dateOfBirth") ? (
                    format(form.getValues("dateOfBirth")!, "PPP")
                  ) : (
                    <span>{t("Pick a date")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.getValues("dateOfBirth")}
                  onSelect={(date) => form.setValue("dateOfBirth", date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.dateOfBirth && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.dateOfBirth.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t("Saving...") : t("Save Changes")}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 