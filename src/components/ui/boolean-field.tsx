"use client";

import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface BooleanFieldProps {
  id: string;
  label: string;
  required?: boolean;
  value?: boolean | null;
  onChange: (value: boolean | null) => void;
  allowUndefined?: boolean;
}

export function BooleanField({
  id,
  label,
  value,
  onChange,
  allowUndefined = true,
}: BooleanFieldProps) {
  const mapToString = (v: boolean | null | undefined) =>
    v === true ? "yes" : v === false ? "no" : "";
  const mapFromString = (v: string): boolean | null =>
    v === "yes" ? true : v === "no" ? false : null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={mapToString(value)}
        onValueChange={(v) => onChange(mapFromString(v))}
      >
        <SelectTrigger id={id}>
          <SelectValue
            placeholder={allowUndefined ? "Select Yes or No" : undefined}
          />
        </SelectTrigger>
        <SelectContent>
          {allowUndefined && <SelectItem value="unset">—</SelectItem>}
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
