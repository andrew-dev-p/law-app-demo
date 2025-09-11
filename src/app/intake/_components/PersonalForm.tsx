"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import type { PersonalInfo } from "../model";

export interface PersonalFormProps {
  value: PersonalInfo;
  onChange: (next: Partial<PersonalInfo>) => void;
}

export function PersonalForm({ value, onChange }: PersonalFormProps) {
  const [q, setQ] = useState(0);

  const questions = useMemo(
    () => [
      {
        key: "firstName" as const,
        label: "First name",
        render: () => (
          <Input
            id="firstName"
            autoFocus
            value={value.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
          />
        ),
        valid: Boolean(value.firstName?.trim()),
      },
      {
        key: "lastName" as const,
        label: "Last name",
        render: () => (
          <Input
            id="lastName"
            autoFocus
            value={value.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
          />
        ),
        valid: Boolean(value.lastName?.trim()),
      },
      {
        key: "email" as const,
        label: "What's the best email to reach you?",
        render: () => (
          <Input
            id="email"
            type="email"
            autoFocus
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        ),
        valid: Boolean(value.email?.trim()),
      },
      {
        key: "phone" as const,
        label: "What's the best phone number to reach you?",
        render: () => (
          <Input
            id="phone"
            placeholder="(555) 555-5555"
            autoFocus
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        ),
        valid: true,
      },
      {
        key: "dob" as const,
        label: "What is your date of birth?",
        render: () => (
          <DatePicker
            id="dob"
            value={value.dob}
            onChange={(v) => onChange({ dob: v })}
          />
        ),
        valid: true,
      },
      {
        key: "address" as const,
        label: "What is your current address?",
        render: () => (
          <Input
            id="address"
            autoFocus
            value={value.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        ),
        valid: true,
      },
    ],
    [value, onChange]
  );

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
          initial={{ opacity: 0, x: 0, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 0, y: -10 }}
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
