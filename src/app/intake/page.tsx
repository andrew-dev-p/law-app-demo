"use client";

import { BackLink } from "@/components/app/back-link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AgreementsForm } from "./_components/AgreementsForm";
import { IncidentVoice } from "./_components/IncidentVoice";
import { MedicalForm } from "./_components/MedicalForm";
import { PersonalForm } from "./_components/PersonalForm";
import { ReviewSection } from "./_components/ReviewSection";
import { StepHeader } from "./_components/StepHeader";
import { UploadsForm } from "./_components/UploadsForm";
import { defaultState, steps, type IntakeState, type UploadItem } from "./model";

export default function IntakePage() {
  const { user } = useUser();
  const [step, setStep] = useState<number>(0);
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
              hipaa: { ...defaultState.agreements.hipaa, ...((parsed as any).agreements?.hipaa || {}) },
              representation: { ...defaultState.agreements.representation, ...((parsed as any).agreements?.representation || {}) },
              fee: { ...defaultState.agreements.fee, ...((parsed as any).agreements?.fee || {}) },
            },
            uploads: Array.isArray(parsed.uploads) ? (parsed.uploads as UploadItem[]) : [],
            agreed: Boolean((parsed as any).agreed),
          } as IntakeState;
        } catch {}
      }
    }
    return defaultState;
  });

  // Prefill from Clerk user/metadata (only fill empty fields)
  useEffect(() => {
    if (!user) return;
    const meta = (user.unsafeMetadata as any) || {};
    setState((s) => {
      const next = {
        firstName: s.personal.firstName || (meta.contactFirstName as string) || user.firstName || "",
        lastName: s.personal.lastName || (meta.contactLastName as string) || user.lastName || "",
        email:
          s.personal.email ||
          (meta.contactEmail as string) ||
          user.primaryEmailAddress?.emailAddress ||
          "",
        phone: s.personal.phone || (meta.contactPhone as string) || "",
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

  // Persist in localStorage (demo-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("intake-state", JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("intake-step", String(step));
    }
  }, [step]);

  const progress = useMemo(() => ((Math.min(step, steps.length - 1) + 1) / steps.length) * 100, [step]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onFileChange = (files: FileList | null) => {
    if (!files) return;
    const items: UploadItem[] = Array.from(files).map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size }));
    setState((s) => ({ ...s, uploads: [...s.uploads, ...items] }));
  };
  const removeUpload = (id: string) => setState((s) => ({ ...s, uploads: s.uploads.filter((u) => u.id !== id) }));

  const submit = () => {
    // Frontend-only demo: pretend to submit
    setStep(steps.length); // go to submitted view
  };

  return (
    <div className="w-full p-6">
      <BackLink className="mb-3" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Client Intake</h1>
        <p className="text-sm text-muted-foreground">Provide details so we can advance your claim.</p>
      </div>

      {step < steps.length ? (
        <StepHeader steps={steps} current={step} onSelect={setStep} progress={progress} />
      ) : (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="success">Submitted</Badge>
            <span className="text-muted-foreground">Your intake has been submitted.</span>
          </div>
          <span className="text-muted-foreground">100% complete</span>
        </div>
      )}

      {step < steps.length && (
      <Card>
        <CardHeader>
          <CardTitle>{steps[step].title}</CardTitle>
          <CardDescription>
            {step === 0 && "Your basic contact information."}
            {step === 1 && "When and how the incident occurred."}
            {step === 2 && "Injuries, treatment, and referral preferences."}
            {step === 3 && "Upload photos, reports, bills, etc."}
            {step === 4 && "Sign HIPAA release and required agreements."}
            {step === 5 && "Confirm and submit your intake."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <PersonalForm
              value={state.personal}
              onChange={(next) => setState((s) => ({ ...s, personal: { ...s.personal, ...next } }))}
            />
          )}

          {step === 1 && (
            <IncidentVoice
              transcript={state.incident.transcript}
              onSave={(t) => setState((s) => ({ ...s, incident: { ...s.incident, transcript: t } }))}
            />
          )}

          {step === 2 && (
            <MedicalForm
              value={state.medical}
              onChange={(next) => setState((s) => ({ ...s, medical: { ...s.medical, ...next } }))}
            />
          )}

          {step === 3 && (
            <UploadsForm uploads={state.uploads} onFileChange={onFileChange} onRemove={removeUpload} />
          )}

          {step === 4 && (
            <AgreementsForm
              value={state.agreements}
              onChange={(agreements) => setState((s) => ({ ...s, agreements }))}
            />
          )}

          {step === 5 && (
            <ReviewSection state={state} onAgreedChange={(agreed) => setState((s) => ({ ...s, agreed }))} />
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={back} disabled={step === 0}>Back</Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                disabled={
                  (step === 0 && (!state.personal.firstName || !state.personal.lastName || !state.personal.email)) ||
                  (step === 1 && (!state.incident.transcript || !state.incident.transcript.trim())) ||
                  (step === 2 && (!state.medical.seenDoctor)) ||
                  (step === 4 && (!state.agreements.hipaa.initials || !state.agreements.hipaa.date || !state.agreements.hipaa.agreed ||
                                   !state.agreements.representation.initials || !state.agreements.representation.date || !state.agreements.representation.agreed ||
                                   !state.agreements.fee.initials || !state.agreements.fee.date || !state.agreements.fee.agreed))
                }
              >
                Continue
              </Button>
            ) : (
              <Button onClick={submit} disabled={!state.agreed}>Submit Intake</Button>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {step >= steps.length && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Intake Submitted</CardTitle>
              <CardDescription>Thank you! We’ll review and follow up shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button variant="secondary" onClick={() => setStep(0)}>Edit Responses</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
