"use client";
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}
interface DatePickerProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({
  id = "date",
  value: externalValue,
  onChange,
  placeholder = "Select date",
}: DatePickerProps) {
  // Parse external value to Date object
  const parseExternalDate = (value: string | undefined): Date | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    return isValidDate(date) ? date : undefined;
  };

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    parseExternalDate(externalValue)
  );
  const [month, setMonth] = React.useState<Date | undefined>(
    parseExternalDate(externalValue) || new Date("2025-06-01")
  );
  const [value, setValue] = React.useState(externalValue || "");

  // Sync with external value changes
  React.useEffect(() => {
    if (externalValue !== value) {
      setValue(externalValue || "");
      const parsedDate = parseExternalDate(externalValue);
      setDate(parsedDate);
      if (parsedDate) {
        setMonth(parsedDate);
      }
    }
  }, [externalValue, value]);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    const formattedValue = formatDate(newDate);
    setValue(formattedValue);
    onChange?.(formattedValue);
    setOpen(false);
  };

  const handleInputChange = (inputValue: string) => {
    setValue(inputValue);
    const parsedDate = new Date(inputValue);
    if (isValidDate(parsedDate)) {
      setDate(parsedDate);
      setMonth(parsedDate);
      onChange?.(inputValue);
    } else {
      onChange?.(inputValue);
    }
  };
  return (
    <div className="w-full">
      <div className="relative">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          className="bg-background pr-10"
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
