"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MedicalInfo } from "../model";

export interface MedicalFormProps {
  value: MedicalInfo;
  onChange: (next: Partial<MedicalInfo>) => void;
}

export function MedicalForm({ value, onChange }: MedicalFormProps) {
  const [q, setQ] = useState(0);

  const toggleInjury = (inj: string) => {
    const active = value.injuries.includes(inj);
    onChange({
      injuries: active
        ? value.injuries.filter((x) => x !== inj)
        : [...value.injuries, inj],
    });
  };

  const questions = useMemo(() => {
    const base = [
      {
        key: "injuries" as const,
        label: "What injuries did you suffer? (select all that apply)",
        render: () => (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              "Head/Neck",
              "Back",
              "Shoulder",
              "Arm/Hand",
              "Hip/Leg",
              "Ankle/Foot",
              "Other",
            ].map((inj) => {
              const active = value.injuries.includes(inj);
              return (
                <button
                  key={inj}
                  type="button"
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm border-border text-left",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-accent"
                  )}
                  onClick={() => toggleInjury(inj)}
                >
                  {inj}
                </button>
              );
            })}
          </div>
        ),
        valid: true,
      },
      {
        key: "seenDoctor" as const,
        label: "Have you seen a doctor yet?",
        render: () => (
          <div className="flex gap-2">
            {["yes", "no"].map((v) => (
              <button
                key={v}
                type="button"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm border-border",
                  value.seenDoctor === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                )}
                onClick={() => onChange({ seenDoctor: v as "yes" | "no" })}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        ),
        valid: value.seenDoctor === "yes" || value.seenDoctor === "no",
      },
      {
        key: "needReferral" as const,
        label: "Would you like us to help you find a provider?",
        render: () => (
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm border-border",
                  value.needReferral === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                )}
                onClick={() => onChange({ needReferral: v })}
              >
                {v ? "YES" : "NO"}
              </button>
            ))}
          </div>
        ),
        valid: typeof value.needReferral === "boolean",
      },
    ];

    if (value.needReferral) {
      base.push(
        {
          key: "preferredProvider" as const,
          label: "What kind of provider do you prefer?",
          render: () => (
            <Input
              id="provider"
              placeholder="e.g., Chiropractor, PCP, PT"
              autoFocus
              value={value.preferredProvider}
              onChange={(e) => onChange({ preferredProvider: e.target.value })}
            />
          ),
          valid: true,
        },
        {
          key: "city" as const,
          label: "Which city should we look in?",
          render: () => (
            <Input
              id="city"
              placeholder="City"
              autoFocus
              value={value.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          ),
          valid: true,
        }
      );
    }

    return base;
  }, [value, onChange]);

  const next = useCallback(
    () => setQ((i) => Math.min(i + 1, questions.length - 1)),
    [questions.length]
  );
  const back = useCallback(() => setQ((i) => Math.max(i - 1, 0)), []);

  const current = questions[q];

  // Global Enter handler to advance when valid
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "BUTTON" ||
          active.getAttribute("data-inner-nav") === "true")
      )
        return;
      if (current.valid && q < questions.length - 1) {
        e.preventDefault();
        next();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current.valid, q, questions.length, next]);

  return (
    <div className="grid gap-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={q}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
          }}
          className="grid gap-3"
        >
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <Label htmlFor={current.key} className="text-sm">
              {current.label}
            </Label>
            <motion.span
              className="text-[11px] text-muted-foreground"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              Question {q + 1} of {questions.length}
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-1"
          >
            {current.render()}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="flex items-center justify-between pt-1"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      >
        <Button
          variant="link"
          size="sm"
          onClick={back}
          disabled={q === 0}
          data-inner-nav="true"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous question
        </Button>
        <div className="flex items-center gap-3">
          {q < questions.length - 1 && (
            <span className="hidden sm:inline text-[11px] text-muted-foreground">
              Press Enter to continue
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={!current.valid || q === questions.length - 1}
            data-inner-nav="true"
          >
            Next question <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
