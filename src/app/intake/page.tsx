"use client";

import { BackLink } from "@/components/app/back-link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Check, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

import { AgreementSection, AgreementsForm } from "./_components/AgreementsForm";
import { IncidentVoice } from "./_components/IncidentVoice";
import { MedicalVoice } from "./_components/MedicalVoice";
import { ReviewSection } from "./_components/ReviewSection";
import { StepHeader } from "./_components/StepHeader";
import { UploadSection, UploadsForm } from "./_components/UploadsForm";
import {
  defaultState,
  steps,
  type IntakeState,
  type UploadItem,
} from "./model";
import {
  cancelIncidentReminders,
  ensureIncidentRemindersScheduled,
} from "@/lib/reminders";
import {
  STEP_TITLES,
  getCurrentStepValidation,
  TOTAL_QUESTIONS,
  SECTION_STARTS,
  getSectionFromQuestion,
  isQuestionnaireActive as isQuestionnaireActiveFn,
  isQuestionnaireComplete as isQuestionnaireCompleteFn,
  isLastStep as isLastStepFn,
  getProgress,
  getCompletedSteps,
  checkSectionCompletion,
} from "./utils";

export default function IntakePage() {
  const { user } = useUser();

  const [step, setStep] = useState<number>(0);

  // TODO: Remove localStorage for demo
  const [state, setState] = useState<IntakeState>(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("intake-state");
      const rawStep = window.localStorage.getItem("intake-step");
      if (rawStep) {
        const n = parseInt(rawStep, 10);
        if (!Number.isNaN(n)) setStep(n);
      }
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<IntakeState>;
          return {
            ...defaultState,
            ...parsed,
            personal: { ...defaultState.personal, ...(parsed.personal || {}) },
            incident: { ...defaultState.incident, ...(parsed.incident || {}) },
            medical: { ...defaultState.medical, ...(parsed.medical || {}) },
            agreements: {
              ...defaultState.agreements,
              ...(parsed as any).agreements,
              hipaa: {
                ...defaultState.agreements.hipaa,
                ...((parsed as any).agreements?.hipaa || {}),
              },
              representation: {
                ...defaultState.agreements.representation,
                ...((parsed as any).agreements?.representation || {}),
              },
              fee: {
                ...defaultState.agreements.fee,
                ...((parsed as any).agreements?.fee || {}),
              },
            },
            uploads: Array.isArray(parsed.uploads)
              ? (parsed.uploads as UploadItem[])
              : [],
            agreed: Boolean((parsed as any).agreed),
          } as IntakeState;
        } catch {}
      }
    }
    return defaultState;
  });

  // TODO: Remove localStorage for demo
  // Prefill from Clerk user/metadata (only fill empty fields)
  useEffect(() => {
    if (!user) return;
    const meta = (user.unsafeMetadata as any) || {};
    setState((s) => {
      const next = {
        firstName:
          s.personal.firstName ||
          (meta.contactFirstName as string) ||
          user.firstName ||
          "",
        lastName:
          s.personal.lastName ||
          (meta.contactLastName as string) ||
          user.lastName ||
          "",
        email:
          s.personal.email ||
          (meta.contactEmail as string) ||
          user.primaryEmailAddress?.emailAddress ||
          "",
        phone: s.personal.phone || (meta.contactPhone as string) || "",
        dob: s.personal.dob || (meta.contactDob as string) || "",
      };
      const unchanged =
        next.firstName === s.personal.firstName &&
        next.lastName === s.personal.lastName &&
        next.email === s.personal.email &&
        next.phone === s.personal.phone;
      if (unchanged) return s;
      return { ...s, personal: { ...s.personal, ...next } };
    });
  }, [user]);

  // TODO: Remove localStorage for demo
  // Persist in localStorage (demo-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("intake-state", JSON.stringify(state));
    }
  }, [state]);

  // TODO: Remove localStorage for demo
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("intake-step", String(step));
    }
  }, [step]);

  // Computed step states for cleaner conditional rendering
  const isQuestionnaireActive = useMemo(
    () => isQuestionnaireActiveFn(step),
    [step]
  );
  const isQuestionnaireComplete = useMemo(
    () => isQuestionnaireCompleteFn(step),
    [step]
  );
  const isLastStep = useMemo(() => isLastStepFn(step), [step]);
  const progress = useMemo(() => getProgress(step), [step]);
  const completedSteps = useMemo(
    () => getCompletedSteps(state, step),
    [state, step]
  );

  // Success animation component for form fields
  const FieldSuccessIndicator = ({ show }: { show: boolean }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.5 }}
          >
            <Check className="h-4 w-4 text-green-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const next = useCallback(() => {
    const nextStep = Math.min(step + 1, TOTAL_QUESTIONS);
    const completedSectionIndex = checkSectionCompletion(state, step, nextStep);

    if (completedSectionIndex !== null) {
      const sectionNames = [
        "Personal Info",
        "Incident Details",
        "Medical Info",
        "Documents",
        "Agreements",
        "Review",
      ];
      const completedSection = sectionNames[completedSectionIndex];

      toast.success(`${completedSection} Complete!`, {
        description: "Great progress! Keep going.",
        icon: <Trophy className="h-4 w-4" />,
        duration: 3000,
        position: "bottom-center",
      });
    }

    setStep(nextStep);
  }, [step, state]);
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onFileUpload = useCallback((items: UploadItem[]) => {
    setState((s) => ({ ...s, uploads: [...s.uploads, ...items] }));
  }, []);

  const removeUpload = useCallback(
    (id: string) =>
      setState((s) => {
        const toRemove = s.uploads.find((u) => u.id === id);
        if (toRemove?.url) {
          try {
            URL.revokeObjectURL(toRemove.url);
          } catch {}
        }
        return { ...s, uploads: s.uploads.filter((u) => u.id !== id) };
      }),
    []
  );

  // Array of render functions for each step to avoid huge switch statement
  const stepRenderers = useMemo(
    () => [
      // Step 0: Full name
      () => {
        const full = [state.personal.firstName, state.personal.lastName]
          .filter(Boolean)
          .join(" ");
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              placeholder="e.g., Jane Doe"
              value={full}
              autoFocus
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (!raw) {
                  setState((s) => ({
                    ...s,
                    personal: {
                      ...s.personal,
                      firstName: "",
                      lastName: "",
                    },
                  }));
                  return;
                }
                const parts = raw.split(/\s+/);
                const first = parts[0] || "";
                const last = parts.slice(1).join(" ");
                setState((s) => ({
                  ...s,
                  personal: {
                    ...s.personal,
                    firstName: first,
                    lastName: last,
                  },
                }));
              }}
            />
          </motion.div>
        );
      },
      // Step 1: Email
      () => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={state.personal.email}
            autoFocus
            onChange={(e) =>
              setState((s) => ({
                ...s,
                personal: { ...s.personal, email: e.target.value },
              }))
            }
          />
        </motion.div>
      ),
      // Step 2: Phone
      () => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="(555) 555-5555"
            value={state.personal.phone}
            autoFocus
            onChange={(e) =>
              setState((s) => ({
                ...s,
                personal: { ...s.personal, phone: e.target.value },
              }))
            }
          />
        </motion.div>
      ),
      // Step 3: Date of birth
      () => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <Label htmlFor="dob">Date of birth</Label>
          <DatePicker
            id="dob"
            value={state.personal.dob}
            onChange={(v) =>
              setState((s) => ({
                ...s,
                personal: { ...s.personal, dob: v },
              }))
            }
          />
        </motion.div>
      ),
      // Step 4: Address
      () => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={state.personal.address}
            autoFocus
            onChange={(e) =>
              setState((s) => ({
                ...s,
                personal: {
                  ...s.personal,
                  address: e.target.value,
                },
              }))
            }
          />
        </motion.div>
      ),
      // Step 5: Incident voice
      () => (
        <IncidentVoice
          transcript={state.incident.transcript}
          onSave={(t) =>
            setState((s) => ({
              ...s,
              incident: { ...s.incident, transcript: t },
            }))
          }
        />
      ),
      // Step 6: Medical voice
      () => (
        <MedicalVoice
          transcript={state.medical.transcript}
          onSave={(t) =>
            setState((s) => ({
              ...s,
              medical: { ...s.medical, transcript: t },
            }))
          }
        />
      ),
      // Step 7: Upload driver's license
      () => (
        <UploadsForm
          section={UploadSection.License}
          uploads={state.uploads}
          onUpload={onFileUpload}
          onRemove={removeUpload}
        />
      ),
      // Step 8: Upload insurance cards
      () => (
        <UploadsForm
          section={UploadSection.Insurance}
          uploads={state.uploads}
          onUpload={onFileUpload}
          onRemove={removeUpload}
        />
      ),
      // Step 9: Upload accident/injury photos
      () => (
        <UploadsForm
          section={UploadSection.Evidence}
          uploads={state.uploads}
          onUpload={onFileUpload}
          onRemove={removeUpload}
        />
      ),
      // Step 10: Sign HIPAA release
      () => (
        <AgreementsForm
          section={AgreementSection.Hipaa}
          value={state.agreements}
          onChange={(agreements) => setState((s) => ({ ...s, agreements }))}
        />
      ),
      // Step 11: Sign representation agreement
      () => (
        <AgreementsForm
          section={AgreementSection.Representation}
          value={state.agreements}
          onChange={(agreements) => setState((s) => ({ ...s, agreements }))}
        />
      ),
      // Step 12: Sign contingency fee agreement
      () => (
        <AgreementsForm
          section={AgreementSection.Fee}
          value={state.agreements}
          onChange={(agreements) => setState((s) => ({ ...s, agreements }))}
        />
      ),
      // Step 13: Review & Submit
      () => (
        <ReviewSection
          state={state}
          onAgreedChange={(agreed) => setState((s) => ({ ...s, agreed }))}
        />
      ),
    ],
    [state, setState, onFileUpload, removeUpload]
  );

  const submit = () => {
    setStep(TOTAL_QUESTIONS);
  };

  // Schedule reminders if incident voice not completed (question 5)
  useEffect(() => {
    if (step === 5 || (step === 6 && !state.incident.transcript?.trim())) {
      ensureIncidentRemindersScheduled();
    }
  }, [step, state.incident.transcript]);

  // If transcript saved, cancel reminders
  useEffect(() => {
    if (state.incident.transcript?.trim()) {
      cancelIncidentReminders("completed");
    }
  }, [state.incident.transcript]);

  // Global Enter-to-continue across the unified questionnaire
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const active = document.activeElement as HTMLElement | null;
      if (active && active.tagName === "BUTTON") return;

      const isValid = getCurrentStepValidation(state, step);
      if (!isLastStep && isValid) {
        e.preventDefault();
        next();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, state, next, isLastStep]);

  return (
    <div className="w-full p-6">
      <BackLink className="mb-3" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Client Intake</h1>
        <p className="text-sm text-muted-foreground">
          Provide details so we can advance your claim.
        </p>
      </div>

      {isQuestionnaireActive ? (
        <StepHeader
          steps={steps}
          current={getSectionFromQuestion(step)}
          onSelect={(i) => {
            setStep(SECTION_STARTS[i] ?? 0);
          }}
          progress={progress}
          completedSteps={completedSteps}
          currentQuestion={step + 1}
          totalQuestions={TOTAL_QUESTIONS}
        />
      ) : (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="success">Submitted</Badge>
            <span className="text-muted-foreground">
              Your intake has been submitted.
            </span>
          </div>
          <span className="text-muted-foreground">100% complete</span>
        </div>
      )}

      {isQuestionnaireActive && (
        <Card>
          <CardHeader>
            <CardTitle>
              {STEP_TITLES[Math.min(step, STEP_TITLES.length - 1)]}
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stepRenderers[Math.min(step, stepRenderers.length - 1)]?.()}
          </CardContent>
        </Card>
      )}

      {isQuestionnaireActive && (
        <div className="mt-3 flex items-center justify-between">
          <Button variant="secondary" onClick={back} disabled={step === 0}>
            Back
          </Button>
          {(() => {
            const isValid = getCurrentStepValidation(state, step);
            if (!isLastStep) {
              return (
                <Button onClick={next} disabled={!isValid}>
                  Continue
                </Button>
              );
            }
            return (
              <Button onClick={submit} disabled={!isValid}>
                Submit Intake
              </Button>
            );
          })()}
        </div>
      )}

      {isQuestionnaireComplete && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Intake Submitted</CardTitle>
              <CardDescription>
                Thank you! We&apos;ll review and follow up shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button variant="secondary" onClick={() => setStep(0)}>
                  Edit Responses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
