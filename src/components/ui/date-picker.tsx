import { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Input } from "./input";

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
            className={cn(
              "bg-darkgray w-full",
              className
            )}
            required={required}
          />
        }
        wrapperClassName="w-full"
        dateFormat="MMMM d, yyyy"
        showMonthDropdown
        dropdownMode="select"
      />
    );
  }
);

DatePicker.displayName = "DatePicker"; 