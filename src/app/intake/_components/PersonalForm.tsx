"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import type { PersonalInfo } from "../model";

export interface PersonalFormProps {
  value: PersonalInfo;
  onChange: (next: Partial<PersonalInfo>) => void;
}

export function PersonalForm({ value, onChange }: PersonalFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" value={value.firstName} onChange={(e) => onChange({ firstName: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" value={value.lastName} onChange={(e) => onChange({ lastName: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" placeholder="(555) 555-5555" value={value.phone} onChange={(e) => onChange({ phone: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="dob">Date of birth</Label>
        <DatePicker id="dob" value={value.dob} onChange={(v) => onChange({ dob: v })} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={value.address} onChange={(e) => onChange({ address: e.target.value })} />
      </div>
    </div>
  );
}

