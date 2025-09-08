"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
};

type IncidentInfo = {
  date: string;
  location: string;
  type: "Auto" | "Slip and Fall" | "Workplace" | "Other" | "";
  description: string;
  policeReport: "yes" | "no" | "";
  claimNumber: string;
};

type MedicalInfo = {
  injuries: string[];
  seenDoctor: "yes" | "no" | "";
  needReferral: boolean;
  preferredProvider: string;
  city: string;
};

type UploadItem = { id: string; name: string; size: number };

type IntakeState = {
  personal: PersonalInfo;
  incident: IncidentInfo;
  medical: MedicalInfo;
  uploads: UploadItem[];
  agreed: boolean;
};

const defaultState: IntakeState = {
  personal: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
  },
  incident: {
    date: "",
    location: "",
    type: "",
    description: "",
    policeReport: "",
    claimNumber: "",
  },
  medical: {
    injuries: [],
    seenDoctor: "",
    needReferral: false,
    preferredProvider: "",
    city: "",
  },
  uploads: [],
  agreed: false,
};

const steps = [
  { key: "personal", title: "Personal Info" },
  { key: "incident", title: "Incident Details" },
  { key: "medical", title: "Medical & Referral" },
  { key: "uploads", title: "Documents" },
  { key: "review", title: "Review & Submit" },
] as const;

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
        try { return JSON.parse(raw) as IntakeState; } catch {}
      }
    }
    return defaultState;
  });

  // Prefill from Clerk user once
  useEffect(() => {
    if (user && !state.personal.email) {
      setState((s) => ({
        ...s,
        personal: {
          ...s.personal,
          email: user.primaryEmailAddress?.emailAddress ?? s.personal.email,
          firstName: user.firstName ?? s.personal.firstName,
          lastName: user.lastName ?? s.personal.lastName,
        },
      }));
    }
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
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Client Intake</h1>
        <p className="text-sm text-muted-foreground">Provide details so we can advance your claim.</p>
      </div>

      {step < steps.length ? (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 whitespace-nowrap snap-x px-0.5">
                {steps.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStep(i)}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      i === step
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    aria-current={i === step ? "step" : undefined}
                  >
                    <span className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
                      i === step ? "border-primary/60 bg-background/20" : "border-border bg-background"
                    )}>{i + 1}</span>
                    <span className="max-w-[140px] truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <span className="shrink-0 text-xs sm:text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="mb-6" />
        </>
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
            {step === 4 && "Confirm and submit your intake."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={state.personal.firstName} onChange={(e) => setState((s) => ({ ...s, personal: { ...s.personal, firstName: e.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={state.personal.lastName} onChange={(e) => setState((s) => ({ ...s, personal: { ...s.personal, lastName: e.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={state.personal.email} onChange={(e) => setState((s) => ({ ...s, personal: { ...s.personal, email: e.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 555-5555" value={state.personal.phone} onChange={(e) => setState((s) => ({ ...s, personal: { ...s.personal, phone: e.target.value } }))} />
              </div>
              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={state.personal.dob} onChange={(e) => setState((s) => ({ ...s, personal: { ...s.personal, dob: e.target.value } }))} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={state.personal.address} onChange={(e) => setState((s) => ({ ...s, personal: { ...s.personal, address: e.target.value } }))} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Incident date</Label>
                  <Input id="date" type="date" value={state.incident.date} onChange={(e) => setState((s) => ({ ...s, incident: { ...s.incident, date: e.target.value } }))} />
                </div>
                <div>
                  <Label htmlFor="location">Location (city / state)</Label>
                  <Input id="location" value={state.incident.location} onChange={(e) => setState((s) => ({ ...s, incident: { ...s.incident, location: e.target.value } }))} />
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
                        state.incident.type === t ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent text-foreground"
                      )}
                      onClick={() => setState((s) => ({ ...s, incident: { ...s.incident, type: t as IncidentInfo["type"] } }))}
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
                  value={state.incident.description}
                  onChange={(e) => setState((s) => ({ ...s, incident: { ...s.incident, description: e.target.value } }))}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Police report filed?</Label>
                  <div className="mt-2 flex gap-2">
                    {["yes", "no"].map((v) => (
                      <button key={v} type="button" className={cn("px-3 py-1.5 rounded-md text-sm border", state.incident.policeReport === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent")} onClick={() => setState((s) => ({ ...s, incident: { ...s.incident, policeReport: v as "yes" | "no" } }))}>
                        {v.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="claim">Claim number (if any)</Label>
                  <Input id="claim" value={state.incident.claimNumber} onChange={(e) => setState((s) => ({ ...s, incident: { ...s.incident, claimNumber: e.target.value } }))} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div>
                <Label>Injuries (select all that apply)</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {["Head/Neck", "Back", "Shoulder", "Arm/Hand", "Hip/Leg", "Ankle/Foot", "Other"].map((inj) => {
                    const active = state.medical.injuries.includes(inj);
                    return (
                      <button
                        key={inj}
                        type="button"
                        className={cn("px-3 py-1.5 rounded-md text-sm border text-left", active ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent")}
                        onClick={() =>
                          setState((s) => ({
                            ...s,
                            medical: {
                              ...s.medical,
                              injuries: active
                                ? s.medical.injuries.filter((x) => x !== inj)
                                : [...s.medical.injuries, inj],
                            },
                          }))
                        }
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
                    <button key={v} type="button" className={cn("px-3 py-1.5 rounded-md text-sm border", state.medical.seenDoctor === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent")} onClick={() => setState((s) => ({ ...s, medical: { ...s.medical, seenDoctor: v as "yes" | "no" } }))}>
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input id="referral" type="checkbox" className="h-4 w-4" checked={state.medical.needReferral} onChange={(e) => setState((s) => ({ ...s, medical: { ...s.medical, needReferral: e.target.checked } }))} />
                  <Label htmlFor="referral">I would like a referral for care</Label>
                </div>
                <div />
                {state.medical.needReferral && (
                  <>
                    <div>
                      <Label htmlFor="provider">Preferred provider type</Label>
                      <Input id="provider" placeholder="e.g., Chiropractor, PCP, PT" value={state.medical.preferredProvider} onChange={(e) => setState((s) => ({ ...s, medical: { ...s.medical, preferredProvider: e.target.value } }))} />
                    </div>
                    <div>
                      <Label htmlFor="city">City for referral</Label>
                      <Input id="city" placeholder="City" value={state.medical.city} onChange={(e) => setState((s) => ({ ...s, medical: { ...s.medical, city: e.target.value } }))} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="files">Upload documents</Label>
                <input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent"
                  onChange={(e) => onFileChange(e.target.files)}
                />
                <p className="text-xs text-muted-foreground mt-1">Accepted: PDF, images. Max 10MB each (demo only).</p>
              </div>
              <div className="divide-y border rounded-md">
                {state.uploads.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">No files added yet.</div>
                )}
                {state.uploads.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{(u.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <Button variant="ghost" onClick={() => removeUpload(u.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Contact</div>
                  <div className="text-sm text-muted-foreground">{state.personal.firstName} {state.personal.lastName}</div>
                  <div className="text-sm text-muted-foreground">{state.personal.email}</div>
                  <div className="text-sm text-muted-foreground">{state.personal.phone}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Incident</div>
                  <div className="text-sm text-muted-foreground">{state.incident.type || "—"} on {state.incident.date || "—"}</div>
                  <div className="text-sm text-muted-foreground">{state.incident.location || "—"}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Injuries</div>
                <div className="text-sm text-muted-foreground">{state.medical.injuries.length ? state.medical.injuries.join(", ") : "—"}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Documents</div>
                <div className="text-sm text-muted-foreground">{state.uploads.length} file(s) attached</div>
              </div>
              <div className="flex items-center gap-2">
                <input id="agree" type="checkbox" className="h-4 w-4" checked={state.agreed} onChange={(e) => setState((s) => ({ ...s, agreed: e.target.checked }))} />
                <Label htmlFor="agree">I confirm the above information is accurate to the best of my knowledge.</Label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={back} disabled={step === 0}>Back</Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                disabled={
                  (step === 0 && (!state.personal.firstName || !state.personal.lastName || !state.personal.email)) ||
                  (step === 1 && (!state.incident.date || !state.incident.type)) ||
                  (step === 2 && (!state.medical.seenDoctor))
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
