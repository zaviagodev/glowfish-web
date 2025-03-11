import { ChangeEvent, forwardRef, MouseEvent } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  className?: string;
  required?: boolean;
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  disabled?: boolean;
  showYearDropdown?: boolean;
  scrollableYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  placeholderText?: string;
  showMonthDropdown?: boolean;
  dropdownMode?: "scroll" | "select";
}

export const DatePicker = forwardRef<ReactDatePicker, DatePickerProps>(
  ({ className, required, onSelect, selected, ...props }, ref) => {
    return (
      <ReactDatePicker
        selected={selected}
        onChange={(date) => {
          if (onSelect) {
            onSelect(date);
          }
        }}
        {...props}
        ref={ref}
        customInput={
          <Input
            className={cn("bg-darkgray w-full", className)}
            required={required}
          />
        }
        wrapperClassName="w-full"
        calendarClassName="!bg-darkgray !text-white !border-input"
        weekDayClassName={() => "!text-white"}
        dateFormat="dd MMM yyyy"
        dropdownMode="select"
        dayClassName={() => "!text-white"}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          changeMonth,
          changeYear,
        }) => {
          const handleMonthChange =
            (delta: number) => (e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              delta > 0 ? increaseMonth() : decreaseMonth();
            };

          const handleSelectChange =
            (callback: (value: number) => void) =>
            (e: ChangeEvent<HTMLSelectElement>) => {
              callback(Number(e.target.value));
            };

          const handleDecreaseMonth = handleMonthChange(-1);
          const handleIncreaseMonth = handleMonthChange(1);
          const handleChangeMonth = handleSelectChange(changeMonth);
          const handleChangeYear = handleSelectChange(changeYear);

          return (
            <div className="p-3 bg-darkgray -mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleDecreaseMonth}
                  className="text-white hover:text-foreground"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span>{format(date, "MMMM yyyy")}</span>
                <button
                  onClick={handleIncreaseMonth}
                  className="text-white hover:text-foreground"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex justify-center bg-darkgray gap-2">
                <select
                  value={date.getMonth()}
                  onChange={handleChangeMonth}
                  className="bg-darkgray text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {format(new Date(0, i), "MMMM")}
                    </option>
                  ))}
                </select>
                <select
                  value={date.getFullYear()}
                  onChange={handleChangeYear}
                  className="bg-darkgray text-white"
                >
                  {Array.from(
                    { length: new Date().getFullYear() - 1900 + 1 },
                    (_, i) => {
                      const year = 1900 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            </div>
          );
        }}
      />
    );
  }
);

DatePicker.displayName = "DatePicker";
