import { useForm } from "react-hook-form";
import { useTranslate } from "@refinedev/core";
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

interface VatFormData {
  companyName: string;
  taxId: string;
  branch?: string;
  address: string;
  is_default: boolean;
}

interface VatFormProps {
  initialData?: VatFormData | null;
  onSubmit: (data: VatFormData) => Promise<void>;
}

export function VatForm({ initialData, onSubmit }: VatFormProps) {
  const t = useTranslate();
  const form = useForm<VatFormData>({
    defaultValues: initialData || {
      companyName: "",
      taxId: "",
      branch: "",
      address: "",
      is_default: false,
    },
  });

  const handleSubmit = async (data: VatFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("vat_profiles").upsert({
        ...data,
        customer_id: user.id,
        ...(initialData?.id ? { id: initialData.id } : {}),
      });

      if (error) throw error;
      onSubmit(data);
    } catch (error) {
      console.error("Error saving VAT profile:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Company Name")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter company name")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Tax ID")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter tax ID")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Branch No.")} ({t("Optional")})
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter branch number")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Company Address")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter company address")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
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
                {t("Set as default company")}
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-[calc(100%_-_32px)] main-btn mt-4 fixed bottom-4 left-4 right-4 max-w-[calc(600px_-_32px)] mx-auto"
        >
          {t("Save Company")}
        </Button>
      </form>
    </Form>
  );
}
