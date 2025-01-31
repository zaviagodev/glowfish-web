import { useForm } from "react-hook-form";
import { useTranslate } from "@refinedev/core";
import { Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

interface AddressFormData {
  full_name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  type: "home" | "office";
  is_default: boolean;
}

interface AddressFormProps {
  initialData?: AddressFormData | null;
  onSubmit: (data: AddressFormData) => Promise<void>;
}

export function AddressForm({ initialData, onSubmit }: AddressFormProps) {
  const t = useTranslate();
  const form = useForm<AddressFormData>({
    defaultValues: initialData || {
      full_name: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postal_code: "",
      type: "home",
      is_default: false,
    },
  });

  const handleSubmit = async (data: AddressFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("customer_addresses").upsert({
        ...data,
        customer_id: user.id,
        ...(initialData?.id ? { id: initialData.id } : {}),
      });

      if (error) throw error;
      onSubmit(data);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pb-20"
      >
        {/* Form Fields */}
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Full Name")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter your full name")}
                  className="h-12 bg-darkgray border-input focus:border-[#EE5736] focus:ring-0"
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
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Phone Number")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter your phone number")}
                  className="h-12 bg-darkgray border-input focus:border-[#EE5736] focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address1"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Street Address")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter street address")}
                  className="h-12 bg-darkgray border-input focus:border-[#EE5736] focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address2"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Building/Unit Number (Optional)")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter building/unit number")}
                  className="h-12 bg-darkgray border-input focus:border-[#EE5736] focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("City")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Enter city")}
                    className="h-12 bg-darkgray border-input focus:border-[#EE5736] focus:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("State/Province")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Enter state")}
                    className="h-12 bg-darkgray border-input focus:border-[#EE5736] focus:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Postal Code")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter postal code")}
                  className="h-12 bg-darkgray border-input focus:border-[#EE5736] focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Address Type")}
              </FormLabel>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={field.value === "home" ? "default" : "outline"}
                  className={`${
                    field.value === "home"
                      ? "main-btn"
                      : "bg-darkgray rounded-full"
                  }`}
                  onClick={() => form.setValue("type", "home")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t("Home")}
                </Button>
                <Button
                  type="button"
                  variant={field.value === "office" ? "default" : "outline"}
                  className={`${
                    field.value === "office"
                      ? "main-btn"
                      : "bg-darkgray rounded-full"
                  }`}
                  onClick={() => form.setValue("type", "office")}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  {t("Office")}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">
                {t("Set as default address")}
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="fixed p-6 bottom-0 left-0 w-full bg-background">
          <Button type="submit" className="main-btn w-full">
            {t("Save Address")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
