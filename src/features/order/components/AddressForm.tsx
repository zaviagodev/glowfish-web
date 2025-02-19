import { useForm } from "react-hook-form";
import { useTranslate } from "@refinedev/core";
import { Home, Building2, Trash2 } from "lucide-react";
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
import { useStore } from "@/hooks/useStore";
import { useCustomer } from "@/hooks/useCustomer";
import { CustomerService } from "@/services/customerService";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Address validation schema
export const addressSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  phone: yup.string().required("Phone number is required"),
  address1: yup.string().required("Street address is required"),
  address2: yup.string(),
  city: yup.string().required("City is required"),
  state: yup.string().required("State/Province is required"),
  postal_code: yup.string().required("Postal code is required"),
  country: yup.string().required("Country is required"),
  type: yup.string().oneOf(["shipping", "billing"]).required(),
  is_default: yup.boolean(),
});

interface AddressFormData {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  type: "shipping" | "billing";
  is_default: boolean;
}

interface AddressFormProps {
  initialData?: AddressFormData;
  onSubmit: (data: AddressFormData) => void;
  onDelete?: (id: string) => void;
}

export function AddressForm({
  initialData,
  onSubmit,
  onDelete,
}: AddressFormProps) {
  const t = useTranslate();
  const { storeName } = useStore();
  const { customer, refreshCustomer } = useCustomer();
  const form = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Thailand",
      type: "shipping",
      is_default: false,
    },
  });

  const handleSubmit = async (data: AddressFormData) => {
    try {
      if (!customer) throw new Error("Customer not found");
      if (!storeName) throw new Error("Store not found");

      const addressData = {
        ...data,
        customer_id: customer.id,
        store_name: storeName,
      };

      if (initialData?.id) {
        // Update existing address
        await CustomerService.updateAddress(
          initialData.id,
          addressData,
          storeName
        );
      } else {
        // Add new address
        await CustomerService.addAddress(addressData, storeName);
      }

      await refreshCustomer();
      onSubmit(data);
    } catch (error) {
      console.error("Error saving address:", error);
      alert(t("Failed to save address. Please try again."));
    }
  };

  const handleDelete = async () => {
    try {
      if (!initialData?.id || !storeName) return;

      await CustomerService.deleteAddress(initialData.id, storeName);
      await refreshCustomer();
      onDelete?.(initialData.id);
    } catch (error) {
      console.error("Error deleting address:", error);
      alert(t("Failed to delete address. Please try again."));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* First Name */}
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("First Name")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter your first name")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Last Name")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter your last name")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Phone Number")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter your phone number")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Line 1 */}
        <FormField
          control={form.control}
          name="address1"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Street Address")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter street address")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Line 2 */}
        <FormField
          control={form.control}
          name="address2"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Building/Unit Number")}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter building/unit number")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City and State */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  {t("City")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Enter city")}
                    className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
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
                  {t("State/Province")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Enter state/province")}
                    className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Postal Code */}
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Postal Code")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter postal code")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {t("Country")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("Enter country")}
                  className="h-12 bg-darkgray border-input focus:border-mainbutton focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Default */}
        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("Set as default address")}</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full main-btn">
          {initialData ? t("Update Address") : t("Add Address")}
        </Button>

        {/* Delete Button */}
        {initialData?.id && onDelete && (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            {t("Delete Address")}
          </Button>
        )}
      </form>
    </Form>
  );
} 