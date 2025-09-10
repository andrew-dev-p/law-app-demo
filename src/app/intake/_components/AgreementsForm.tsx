"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import type { IntakeState } from "../model";

export interface AgreementsFormProps {
  value: IntakeState["agreements"];
  onChange: (next: IntakeState["agreements"]) => void;
}

export function AgreementsForm({ value, onChange }: AgreementsFormProps) {
  const update = (section: keyof typeof value, field: "initials" | "date" | "agreed", v: string | boolean) => {
    onChange({
      ...value,
      [section]: {
        ...value[section],
        [field]: v as any,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-card-border p-3">
        <div className="font-medium">HIPAA Release Authorization</div>
        <p className="text-sm text-muted-foreground mt-1">I authorize the release of my medical information to my attorneys for purposes of my claim.</p>
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="hipaa-initials">Initials</Label>
            <Input id="hipaa-initials" value={value.hipaa.initials} onChange={(e) => update("hipaa", "initials", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="hipaa-date">Date</Label>
            <DatePicker id="hipaa-date" value={value.hipaa.date} onChange={(v) => update("hipaa", "date", v)} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" className="h-4 w-4" checked={value.hipaa.agreed} onChange={(e) => update("hipaa", "agreed", e.target.checked)} />
              I agree
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-card-border p-3">
        <div className="font-medium">Representation Agreement</div>
        <p className="text-sm text-muted-foreground mt-1">I retain the firm to represent me regarding my personal injury matter.</p>
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="rep-initials">Initials</Label>
            <Input id="rep-initials" value={value.representation.initials} onChange={(e) => update("representation", "initials", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="rep-date">Date</Label>
            <DatePicker id="rep-date" value={value.representation.date} onChange={(v) => update("representation", "date", v)} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" className="h-4 w-4" checked={value.representation.agreed} onChange={(e) => update("representation", "agreed", e.target.checked)} />
              I agree
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-card-border p-3">
        <div className="font-medium">Contingency Fee Agreement</div>
        <p className="text-sm text-muted-foreground mt-1">Fees are contingent on recovery and will be calculated per our agreement.</p>
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="fee-initials">Initials</Label>
            <Input id="fee-initials" value={value.fee.initials} onChange={(e) => update("fee", "initials", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fee-date">Date</Label>
            <DatePicker id="fee-date" value={value.fee.date} onChange={(v) => update("fee", "date", v)} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" className="h-4 w-4" checked={value.fee.agreed} onChange={(e) => update("fee", "agreed", e.target.checked)} />
              I agree
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

