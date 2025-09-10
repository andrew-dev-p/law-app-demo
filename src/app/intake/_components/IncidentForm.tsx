"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import type { IncidentInfo } from "../model";

export interface IncidentFormProps {
  value: IncidentInfo;
  onChange: (next: Partial<IncidentInfo>) => void;
}

export function IncidentForm({ value, onChange }: IncidentFormProps) {
  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Incident date</Label>
          <DatePicker id="date" value={value.date} onChange={(v) => onChange({ date: v })} />
        </div>
        <div>
          <Label htmlFor="location">Location (city / state)</Label>
          <Input id="location" value={value.location} onChange={(e) => onChange({ location: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {["Auto", "Slip and Fall", "Workplace", "Other"].map((t) => (
            <button
              key={t}
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-md text-sm border",
                value.type === t ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent text-foreground"
              )}
              onClick={() => onChange({ type: t as IncidentInfo["type"] })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Brief description</Label>
        <textarea
          id="description"
          rows={4}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="What happened?"
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Police report filed?</Label>
          <div className="mt-2 flex gap-2">
            {["yes", "no"].map((v) => (
              <button
                key={v}
                type="button"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm border",
                  value.policeReport === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
                )}
                onClick={() => onChange({ policeReport: v as "yes" | "no" })}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="claim">Claim number (if any)</Label>
          <Input id="claim" value={value.claimNumber} onChange={(e) => onChange({ claimNumber: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

