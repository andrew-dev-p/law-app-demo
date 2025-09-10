"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MedicalInfo } from "../model";

export interface MedicalFormProps {
  value: MedicalInfo;
  onChange: (next: Partial<MedicalInfo>) => void;
}

export function MedicalForm({ value, onChange }: MedicalFormProps) {
  const toggleInjury = (inj: string) => {
    const active = value.injuries.includes(inj);
    onChange({ injuries: active ? value.injuries.filter((x) => x !== inj) : [...value.injuries, inj] });
  };

  return (
    <div className="grid gap-4">
      <div>
        <Label>Injuries (select all that apply)</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {["Head/Neck", "Back", "Shoulder", "Arm/Hand", "Hip/Leg", "Ankle/Foot", "Other"].map((inj) => {
            const active = value.injuries.includes(inj);
            return (
              <button
                key={inj}
                type="button"
                className={cn("px-3 py-1.5 rounded-md text-sm border text-left", active ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent")}
                onClick={() => toggleInjury(inj)}
              >
                {inj}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Have you seen a doctor?</Label>
        <div className="mt-2 flex gap-2">
          {["yes", "no"].map((v) => (
            <button
              key={v}
              type="button"
              className={cn("px-3 py-1.5 rounded-md text-sm border", value.seenDoctor === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent")}
              onClick={() => onChange({ seenDoctor: v as "yes" | "no" })}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            id="referral"
            type="checkbox"
            className="h-4 w-4"
            checked={value.needReferral}
            onChange={(e) => onChange({ needReferral: e.target.checked })}
          />
          <Label htmlFor="referral">I would like a referral for care</Label>
        </div>
        <div />
        {value.needReferral && (
          <>
            <div>
              <Label htmlFor="provider">Preferred provider type</Label>
              <Input id="provider" placeholder="e.g., Chiropractor, PCP, PT" value={value.preferredProvider} onChange={(e) => onChange({ preferredProvider: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="city">City for referral</Label>
              <Input id="city" placeholder="City" value={value.city} onChange={(e) => onChange({ city: e.target.value })} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

