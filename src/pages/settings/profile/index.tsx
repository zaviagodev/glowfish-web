import { useState, useEffect } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useTranslate } from "@refinedev/core";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import Header from "@/components/main/Header";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { useCustomer } from "@/hooks/useCustomer";

const schema = yup.object().shape({
  full_name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  birthday: yup.date().nullable().required("Birthday is required"),
});

const ProfileSettings = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { customer, refreshCustomer } = useCustomer();

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      birthday: null,
    },
  });

  useEffect(() => {
    if (customer) {
      const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
      const birthday = customer.date_of_birth ? new Date(customer.date_of_birth) : null;
      form.reset({
        full_name: fullName,
        email: customer.email || "",
        phone: customer.phone || "",
        birthday: birthday,
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
  
      const fileExt = file.name.split('.').pop();
      const filePath = `glowfish/customers/avatars/${user.id}.${fileExt}`;
  
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });
  
      if (uploadError) throw uploadError;
  
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
  
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${publicUrl}?t=${timestamp}`;
  
      const { error: updateError } = await supabase
        .from('customers')
        .update({ avatar_url: urlWithTimestamp })
        .eq('auth_id', user.id);
  
      if (updateError) throw updateError;
  
      setAvatarUrl(urlWithTimestamp);
      await refreshCustomer();

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setError(error.message || "Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
      setIsLoading(true);
      setError("");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Split full name into first and last name
      const nameParts = data.full_name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const { error: updateError } = await supabase
        .from('customers')
        .update({
          first_name: firstName,
          last_name: lastName || '',
          email: data.email,
          date_of_birth: data.birthday?.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', user.id);

      if (updateError) throw updateError;

      await refreshCustomer();
      navigate("/settings");
  };

  return (
    <>
      <Header title={t("Profile Settings")} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-5">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {form.getValues("full_name")?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                accept="image/*"
                id="avatar"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <label
                htmlFor="avatar"
                className="text-mainorange cursor-pointer text-sm"
              >
                {t("Change Profile Picture")}
              </label>
            </div>
          </div>

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Full Name")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your full name" />
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
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter your email address" />
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
                <FormLabel>{t("Phone")}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel" 
                    placeholder="+66812345678" 
                    disabled={true}
                    className="opacity-70 cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("Birthday")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className={cn(
                          "flex items-center h-12 w-full rounded-md bg-darkgray outline-none border border-input text-white px-3 py-2 text-left justify-between",
                          !field.value && "text-[#979797]"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t("Pick a date")}</span>
                        )}
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-darkgray border-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="text-white"
                      classNames={{
                        months: "space-y-4",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-white rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-9 w-9 p-0 font-normal text-white aria-selected:opacity-100 hover:bg-[#6D6D6D] focus:bg-[#6D6D6D]"
                        ),
                        day_range_end: "day-range-end",
                        day_selected: "bg-[#6D6D6D] text-white hover:bg-[#6D6D6D] hover:text-white focus:bg-[#6D6D6D] focus:text-white",
                        day_today: "bg-[#6D6D6D] text-white",
                        day_outside: "text-[#979797] opacity-50 aria-selected:bg-accent/50 aria-selected:opacity-30",
                        day_disabled: "text-[#979797] opacity-50",
                        day_hidden: "invisible"
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              className="main-btn !bg-mainorange w-full"
              disabled={isLoading}
            >
              {isLoading ? t("Saving...") : t("Save Changes")}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProfileSettings;