"use client";
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface DatePickerProps {
  id?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({ id, value, onChange, placeholder = "Pick a date", disabled, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(() => (value ? new Date(`${value}T00:00:00`) : undefined), [value]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            // Make it look like an input, not a primary-outlined button
            "h-9 w-full justify-start text-left font-normal border-input bg-[hsl(var(--background))] text-foreground hover:bg-accent",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
          {selected ? selected.toLocaleDateString() : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0 h-[331px]">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (!d) return;
            onChange?.(toYMD(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
