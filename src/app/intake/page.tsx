"use client";

import { BackLink } from "@/components/app/back-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";

import {
  cancelIncidentReminders,
  ensureIncidentRemindersScheduled,
} from "@/lib/reminders";
import { AddressStep } from "./_components/AddressStep";
import { AgreementSection, AgreementsForm } from "./_components/AgreementsForm";
import { DateOfBirthStep } from "./_components/DateOfBirthStep";
import { EmailStep } from "./_components/EmailStep";
import { FullNameStep } from "./_components/FullNameStep";
import { IncidentVoice } from "./_components/IncidentVoice";
import { MedicalVoice } from "./_components/MedicalVoice";
import { PhoneStep } from "./_components/PhoneStep";
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
  SECTION_STARTS,
  STEP_TITLES,
  TOTAL_QUESTIONS,
  checkSectionCompletion,
  getCompletedSteps,
  getCurrentStepValidation,
  getProgress,
  getSectionFromQuestion,
  isLastStep as isLastStepFn,
  isQuestionnaireActive as isQuestionnaireActiveFn,
  isQuestionnaireComplete as isQuestionnaireCompleteFn,
} from "./utils";

export default function IntakePage() {
  const { user } = useUser();

  const [step, setStep] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

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
      () => (
        <FullNameStep
          firstName={state.personal.firstName}
          lastName={state.personal.lastName}
          onChange={(data) =>
            setState((s) => ({
              ...s,
              personal: { ...s.personal, ...data },
            }))
          }
        />
      ),
      // Step 1: Email
      () => (
        <EmailStep
          email={state.personal.email}
          onChange={(data) =>
            setState((s) => ({
              ...s,
              personal: { ...s.personal, ...data },
            }))
          }
        />
      ),
      // Step 2: Phone
      () => (
        <PhoneStep
          phone={state.personal.phone}
          onChange={(data) =>
            setState((s) => ({
              ...s,
              personal: { ...s.personal, ...data },
            }))
          }
        />
      ),
      // Step 3: Date of birth
      () => (
        <DateOfBirthStep
          dob={state.personal.dob}
          onChange={(data) =>
            setState((s) => ({
              ...s,
              personal: { ...s.personal, ...data },
            }))
          }
        />
      ),
      // Step 4: Address
      () => (
        <AddressStep
          address={state.personal.address}
          onChange={(data) =>
            setState((s) => ({
              ...s,
              personal: { ...s.personal, ...data },
            }))
          }
        />
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
    setShowConfetti(true);
    // Hide confetti after 5 seconds
    setTimeout(() => setShowConfetti(false), 5000);
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
    <div className="w-full p-6 relative">
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 1000}
          height={typeof window !== "undefined" ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={150}
          gravity={0.5}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
      <BackLink className="mb-3" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome to Injuro</h1>
        <p className="text-sm text-muted-foreground">
          Our team is ready to assist you. Let&apos;s get started by collecting
          basic information to file your claim.
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
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    Press <span className="font-bold">Enter</span> to continue
                  </p>
                  <Button onClick={next} disabled={!isValid}>
                    Continue
                  </Button>
                </div>
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
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 8, scale: 0.975 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2,
          }}
        >
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
        </motion.div>
      )}
    </div>
  );
}
