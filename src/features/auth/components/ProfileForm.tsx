import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslate } from "@refinedev/core";
import { useNavigate, useLocation } from "react-router-dom";
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
import { DatePicker } from "@/components/ui/date-picker";
import { toZonedTime } from "date-fns-tz";

interface ProfileFormProps {
  onComplete?: () => void;
  mode?: "setup" | "edit";
}

export const ProfileForm = ({
  onComplete,
  mode = "edit",
}: ProfileFormProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfileSetup = mode === "setup";
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { storeName } = useStore();
  const { customer, refreshCustomer } = useCustomer();
  const isEditMode = !isProfileSetup && Boolean(customer?.date_of_birth);
  const labelClassName = cn(
    "block text-sm font-medium",
    "text-card-foreground",
    { "dark:text-muted-foreground text-link": isProfileSetup }
  );

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
        firstName: isProfileSetup ? "" : customer.first_name || "",
        lastName: isProfileSetup ? "" : customer.last_name || "",
        email: isProfileSetup ? "" : customer.email || "",
        company: customer.company || "",
        dateOfBirth: customer.date_of_birth
          ? new Date(customer.date_of_birth)
          : undefined,
      });
      setAvatarUrl(customer.avatar_url || "");
    }
  }, [customer, isProfileSetup]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split(".").pop();
      const filePath = `${storeName}/customers/avatars/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get current customer data to preserve existing meta
      const { data: currentCustomer } = await supabase
        .from("customers")
        .select("meta")
        .eq("auth_id", user.id)
        .single();

      // Merge existing meta with new values
      const updatedMeta = {
        ...(currentCustomer?.meta || {}),
        profile_setup_completed: true,
        profile_setup_completed_at: new Date().toISOString(),
      };

      // Convert date of birth to UTC ISO string
      const dateOfBirth = data.dateOfBirth
        ? toZonedTime(data.dateOfBirth, "UTC").toISOString()
        : null;

      // Update customer record with merged meta
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
          date_of_birth: data.dateOfBirth?.toISOString(),
          updated_at: new Date().toISOString(),
          meta: updatedMeta,
        })
        .eq("auth_id", user.id);

      if (customerError) {
        // Check for duplicate email error
        if (
          customerError.code === "23505" &&
          customerError.message.includes("customers_store_name_email_key")
        ) {
          const duplicateEmailMessage = "This email already exists";
          form.setError("email", { message: duplicateEmailMessage });
          addToast(duplicateEmailMessage, "error");
          return;
        }
        throw customerError;
      }

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
          <div className="bg-destructive/15 text-red-500 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div
          className={cn("flex flex-col items-center gap-4", {
            "items-start": isProfileSetup,
          })}
        >
          <Avatar
            className={cn("h-24 w-24", {
              "rounded-3xl border-2 border-foreground": isProfileSetup,
            })}
          >
            <AvatarImage src={avatarUrl} />
            <AvatarFallback
              className={isProfileSetup ? "rounded-3xl" : "rounded-full"}
            >
              {form.getValues("firstName")?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {isProfileSetup && (
            <h1 className="main-heading">
              Become a part of Good Afterwork Community and see the latest event
            </h1>
          )}
          <input
            type="file"
            accept="image/*"
            id="avatar"
            className="hidden"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="firstName" className={labelClassName}>
              {t(isProfileSetup ? "What should we call you?" : "First Name")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              disabled={isLoading}
              className="bg-darkgray"
              placeholder="John"
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="lastName" className={labelClassName}>
              {t(isProfileSetup ? "What is your last name?" : "Last Name")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              disabled={isLoading}
              className="bg-darkgray"
              placeholder="Doe"
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="company" className={labelClassName}>
              {t("Company")}
            </label>
            <Input
              id="company"
              {...form.register("company")}
              disabled={isLoading}
              className="bg-darkgray"
              placeholder="Your company name"
            />
            {/* {form.formState.errors.company && (
              <p className="text-sm text-red-500">
                {form.formState.errors.company.message}
              </p>
            )} */}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className={labelClassName}>
              {t("Email")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              disabled={isLoading}
              className="bg-darkgray"
              placeholder="youremail@gmail.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="dateOfBirth" className={labelClassName}>
              {t("Date of Birth")} <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={form.watch("dateOfBirth")}
              onSelect={(date) => {
                if (date) {
                  form.setValue("dateOfBirth", date);
                }
              }}
              disabled={isLoading || isEditMode}
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              placeholderText={t("DD MM YYYY")}
              className="w-full"
              required
            />
            {form.formState.errors.dateOfBirth && (
              <p className="text-sm text-red-500">
                {form.formState.errors.dateOfBirth.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full main-btn"
          >
            {isLoading
              ? t("Saving...")
              : t(isProfileSetup ? "Next" : "Save Changes")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
