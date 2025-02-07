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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type RegisterFormProps = {
  initialValues?: {
    first_name: string;
    last_name: string;
    company?: string;
    // phone: string;
    email: string;
    date_of_birth: string;
  };
};

const RegisterForm = ({
  initialValues = {
    first_name: "",
    last_name: "",
    company: "",
    // phone: "",
    email: "",
    date_of_birth: "",
  },
}: RegisterFormProps) => {
  const t = useTranslate();
  const navigate = useNavigate();
  const form = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Save the data to backend
      await console.log(data);
      navigate("/phone-verification");
    } catch (err) {
      console.log("Failed to submit", err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="first_name" className="text-muted-foreground">
                {t("What should we call you?")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("John")}
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
                {t("What is your last name?")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Doe")}
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
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="company" className="text-muted-foreground">
                {t("Company")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Your company name")}
                  {...field}
                  className="font-sfpro-rounded font-semibold main-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone" className="text-muted-foreground">
                {t("Phone")} <span className="text-red-500">*</span>
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
        /> */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email" className="text-muted-foreground">
                {t("Email")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("youremail@mail.com")}
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
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                htmlFor="date_of_birth"
                className="text-muted-foreground"
              >
                {t("Date of birth")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className={cn(
                          "flex items-center h-12 text-base font-semibold w-full rounded-md !bg-darkgray outline-none border border-input text-white px-3 py-2 text-left justify-between",
                          !field.value && "text-[#979797]"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>{t("DD/MM/YYYY")}</span>
                        )}
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-darkgray border-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      initialFocus
                      className="text-white"
                      classNames={{
                        months: "space-y-4",
                        month: "space-y-4",
                        vhidden: "hidden",
                        caption:
                          "flex justify-center pt-1 relative items-center",
                        caption_label: "hidden",
                        caption_dropdowns: "flex gap-2",
                        nav: "space-x-1 flex items-center",
                        dropdown:
                          "bg-darkgray appearance-none outline-none text-sm min-w-[30px] focus:w-auto max-w-[72px]",
                        dropdown_icon: "hidden",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell:
                          "text-white rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-9 w-9 p-0 font-normal text-white aria-selected:opacity-100 hover:bg-[#6D6D6D] focus:bg-[#6D6D6D]"
                        ),
                        day_range_end: "day-range-end",
                        day_selected:
                          "bg-[#6D6D6D] text-white hover:bg-[#6D6D6D] hover:text-white focus:bg-[#6D6D6D] focus:text-white",
                        day_today: "bg-[#6D6D6D]/50 text-white",
                        day_outside:
                          "text-[#979797] opacity-50 aria-selected:bg-accent/50 aria-selected:opacity-30",
                        day_disabled: "text-[#979797] opacity-50",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="main-btn w-full" type="submit">
          {t("Next")}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
