"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface StepHeaderProps {
  steps: readonly { key: string; title: string }[];
  current: number;
  onSelect: (index: number) => void;
  progress: number; // 0-100
}

export function StepHeader({ steps, current, onSelect, progress }: StepHeaderProps) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 whitespace-nowrap snap-x px-0.5">
            {steps.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  i === current
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                aria-current={i === current ? "step" : undefined}
              >
                <span
                  className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
                    i === current ? "border-primary/60 bg-background/20" : "border-border bg-background"
                  )}
                >
                  {i + 1}
                </span>
                <span className="max-w-[140px] truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
        <span className="shrink-0 text-xs sm:text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
      </div>
      <Progress value={progress} className="mb-6" />
    </>
  );
}

