import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn, generateTimeSlots } from "@/lib/utils";
import { format } from "date-fns"
import { Button } from "@/components/ui/button";
import { useTranslate } from "@refinedev/core";

const DateGroup = () => {
    const [date, setDate] = useState<Date>();
    const t = useTranslate();
    const timeSlots = generateTimeSlots();

    return (
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("justify-start text-left font-normal !bg-darkgray !text-white border-0 !text-sm px-3 py-1.5 h-9")}
              >
                {date ? format(date, "PPP") : <span>{t("Pick a date")}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-darkgray text-white !border-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                classNames={{
                  table: "!border-0", 
                  nav_button: "border-0",
                  head_cell: "rounded-md w-9 font-normal text-[0.8rem] border-0",
                  cell: "h-9 w-9 text-center text-sm p-0 !text-white relative [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 border-0",
                  day_selected: "!bg-[#6D6D6D]",
                  day_today: "!bg-[#6D6D6D]"
                }}
              />
            </PopoverContent>
          </Popover>

          <Select>
            <SelectTrigger className="!text-sm !bg-darkgray w-fit px-3 py-1.5 h-9">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent className="bg-darkgray text-white border-0">
              <SelectGroup className="bg-darkgray text-white">
                {timeSlots.map(time => (
                  <SelectItem value={time}>{time}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
    )
}

export default DateGroup