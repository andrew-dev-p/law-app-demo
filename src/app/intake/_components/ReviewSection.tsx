"use client";

import { Label } from "@/components/ui/label";
import type { IntakeState } from "../model";

export interface ReviewSectionProps {
  state: IntakeState;
  onAgreedChange: (agreed: boolean) => void;
}

export function ReviewSection({ state, onAgreedChange }: ReviewSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium mb-1">Contact</div>
          <div className="text-sm text-muted-foreground">
            {state.personal.firstName} {state.personal.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {state.personal.email}
          </div>
          <div className="text-sm text-muted-foreground">
            {state.personal.phone}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">Incident</div>
          <div className="text-sm text-muted-foreground">
            {state.incident.type || state.incident.transcript?.trim() || "—"}
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Injuries</div>
        <div className="text-sm text-muted-foreground">
          {state.medical.injuries.length
            ? state.medical.injuries.join(", ")
            : "—"}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Documents</div>
        <div className="text-sm text-muted-foreground">
          {state.uploads.length} file(s) attached
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="agree"
          type="checkbox"
          className="h-4 w-4"
          checked={state.agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
        />
        <Label htmlFor="agree">
          I confirm the above information is accurate to the best of my
          knowledge.
        </Label>
      </div>
    </div>
  );
}
