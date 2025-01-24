import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { cn, generateTimeSlots } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { dateGroupSchema } from "./dateGroupSchema";

type DateGroupProps = {
  initialValues?: {
    event_date: Date;
    event_time: string;
  };
  onSubmit: (val?: any) => void;
};

const DateGroup = ({
  initialValues = {
    event_date: new Date(),
    event_time: "",
  },
  onSubmit,
}: DateGroupProps) => {
  const t = useTranslate();
  const timeSlots = generateTimeSlots();
  const form = useForm({
    resolver: yupResolver(dateGroupSchema),
    defaultValues: {
      ...initialValues,
      event_time: timeSlots[0],
    },
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-3"
      >
        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal !bg-darkgray !text-white border-0 !text-sm px-3 py-1.5 h-9"
                    )}
                  >
                    {form.getValues("event_date") ? (
                      format(form.getValues("event_date") ?? "", "PP")
                    ) : (
                      <span>{t("Pick a date")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-darkgray text-white !border-0">
                  <Calendar
                    mode="single"
                    selected={form.getValues("event_date")}
                    onSelect={(date) => form.setValue("event_date", date)}
                    initialFocus
                    classNames={{
                      table: "!border-0",
                      nav_button: "border-0",
                      head_cell:
                        "rounded-md w-9 font-normal text-[0.8rem] border-0",
                      cell: "h-9 w-9 text-center text-sm p-0 !text-white relative [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 border-0",
                      day_selected: "!bg-[#6D6D6D]",
                      day_today: "!bg-[#6D6D6D]",
                    }}
                    {...field}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="event_time"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  onValueChange={(val: any) => form.setValue("event_time", val)}
                  {...field}
                >
                  <SelectTrigger className="!text-sm !bg-darkgray w-fit px-3 py-1.5 h-9">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkgray text-white border-0">
                    <SelectGroup className="bg-darkgray text-white">
                      {timeSlots.map((time) => (
                        <SelectItem value={time}>{time}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <footer className="btn-footer">
          <Button
            className="main-btn !bg-[#F4DC53] text-secondary-foreground"
            type="submit"
          >
            {t("Confirm booking")}
          </Button>
        </footer>
      </form>
    </Form>
  );
};

export default DateGroup;
