"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, Circle, Play } from "lucide-react";

export interface StepHeaderProps {
  steps: readonly { key: string; title: string }[];
  current: number;
  onSelect: (index: number) => void;
  progress: number; // 0-100
  completedSteps?: number[]; // Array of completed step indices
  currentQuestion?: number; // Current question number (1-14)
  totalQuestions?: number; // Total number of questions
}

export function StepHeader({
  steps,
  current,
  onSelect,
  progress,
  completedSteps = [],
  currentQuestion = 1,
  totalQuestions = 14,
}: StepHeaderProps) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 whitespace-nowrap snap-x px-1">
            {steps.map((s, i) => {
              const isCompleted = completedSteps.includes(i);
              const isCurrent = i === current;

              return (
                <motion.button
                  key={s.key}
                  type="button"
                  onClick={() => onSelect(i)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-200",
                    isCurrent
                      ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      : isCompleted
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: isCompleted ? 1.025 : 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.05,
                  }}
                >
                  <motion.span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-medium",
                      isCurrent
                        ? "border-blue-300 bg-blue-100 text-blue-700"
                        : isCompleted
                        ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                        : "border-border bg-background"
                    )}
                    animate={
                      isCompleted
                        ? {
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : isCurrent ? (
                      <Circle className="h-3 w-3 animate-pulse" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </motion.span>
                  <span className="max-w-[140px] truncate">{s.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
          <motion.span
            className="text-[10px] text-muted-foreground"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Question {currentQuestion}/{totalQuestions}
          </motion.span>
        </div>
      </div>
      <Progress value={progress} className="mb-6" />
    </>
  );
}
