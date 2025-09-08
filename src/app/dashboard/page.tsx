"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type IntakeState = {
  personal: { firstName: string; lastName: string; email: string };
  incident: { date: string; type: string };
  medical: { seenDoctor: "yes" | "no" | ""; injuries: string[]; needReferral: boolean };
  uploads: { id: string }[];
  agreed: boolean;
};

export default function DashboardPage() {
  const [intake, setIntake] = useState<IntakeState | null>(null);
  const [intakeStep, setIntakeStep] = useState<number>(0);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [demand, setDemand] = useState<{ draftReady: boolean; approved: boolean } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("intake-state");
        const rawStep = window.localStorage.getItem("intake-step");
        if (raw) setIntake(JSON.parse(raw));
        if (rawStep) setIntakeStep(parseInt(rawStep, 10) || 0);
        const c = window.localStorage.getItem("checkins-data");
        if (c) setCheckins(JSON.parse(c));
        const p = window.localStorage.getItem("bills-records-providers");
        if (p) setProviders(JSON.parse(p));
        const d = window.localStorage.getItem("demand-state");
        if (d) setDemand(JSON.parse(d));
      } catch {}
    }
  }, []);

  const intakeCompletion = useMemo(() => {
    if (!intake) return 0;
    let score = 0;
    let total = 5; // personal, incident, medical, uploads, review
    const p = intake.personal;
    if (p.firstName && p.lastName && p.email) score++;
    const i = intake.incident;
    if (i.date && i.type) score++;
    const m = intake.medical;
    if (m.seenDoctor) score++;
    if ((intake.uploads?.length ?? 0) > 0) score++;
    if (intake.agreed) score++;
    return Math.round((score / total) * 100);
  }, [intake]);

  const claimMilestones = useMemo(() => {
    const items = [
      { id: "intake", label: "Intake Submitted", done: intakeStep >= 5 },
      { id: "records", label: "Records Requested", done: providers.some((p) => p.recordsRequested) || (intake?.medical?.seenDoctor === "yes") || false },
      { id: "bills", label: "Bills Collection", done: providers.some((p) => p.billsReceived) || (intake?.uploads?.length ?? 0) > 0 },
      { id: "demand", label: "Demand Drafting", done: intakeCompletion >= 60 && (providers.some((p) => p.recordsReceived) || (intake?.uploads?.length ?? 0) > 0) },
      { id: "review", label: "Demand Ready for Review", done: !!demand?.draftReady },
      { id: "approve", label: "Demand Approved to Send", done: !!demand?.approved },
    ];
    const completed = items.filter((x) => x.done).length;
    return { items, completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  }, [intake, intakeStep, intakeCompletion]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Case Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track progress across intake, records, demand, and more.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <a href="/intake">Update Intake</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/claims">Claims Overview</a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Claims Milestones</CardTitle>
            <CardDescription>Overall progress across key steps.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{claimMilestones.completed} of {claimMilestones.total} completed</span>
              <span className="text-muted-foreground">{claimMilestones.percent}%</span>
            </div>
            <Progress value={claimMilestones.percent} />
            <ul className="mt-4 space-y-2">
              {claimMilestones.items.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">{m.label}</span>
                  {m.done ? <Badge variant="success">Done</Badge> : <Badge variant="outline">Pending</Badge>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intake Status</CardTitle>
            <CardDescription>Completion of your intake flow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{intakeCompletion}%</span>
              <Badge variant={intakeStep >= 5 ? "success" : "outline"}>{intakeStep >= 5 ? "Submitted" : "In progress"}</Badge>
            </div>
            <Progress value={intakeCompletion} />
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <div>Personal: {intake?.personal?.firstName ? "✓" : "—"}</div>
              <div>Incident: {intake?.incident?.date && intake?.incident?.type ? "✓" : "—"}</div>
              <div>Medical: {intake?.medical?.seenDoctor ? "✓" : "—"}</div>
              <div>Documents: {(intake?.uploads?.length ?? 0) > 0 ? `${intake?.uploads?.length} file(s)` : "—"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next Actions</CardTitle>
            <CardDescription>Keep momentum by handling these.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(!intake || !intake.personal?.firstName) && (
                <li className="rounded-md border px-3 py-2">Complete personal information in <a href="/intake" className="underline">Intake</a>.</li>
              )}
              {intake && !intake.medical?.seenDoctor && (
                <li className="rounded-md border px-3 py-2">Tell us if you’ve seen a doctor (Intake → Medical).</li>
              )}
              {intake && (intake.uploads?.length ?? 0) === 0 && (
                <li className="rounded-md border px-3 py-2">Upload photos, reports, or bills in <a href="/intake" className="underline">Intake</a>.</li>
              )}
              {providers.length === 0 && (
                <li className="rounded-md border px-3 py-2">Add your treatment providers in <a href="/bills-records" className="underline">Bills & Records</a>.</li>
              )}
              {!providers.some((p) => p.recordsRequested) && (
                <li className="rounded-md border px-3 py-2">Mark records as requested for at least one provider.</li>
              )}
              {intake && intakeCompletion >= 60 && !demand?.draftReady && (
                <li className="rounded-md border px-3 py-2">Visit <a href="/demand-review" className="underline">Demand Review</a> to generate your draft.</li>
              )}
              {demand?.draftReady && !demand?.approved && (
                <li className="rounded-md border px-3 py-2">Open <a href="/demand-review" className="underline">Demand Review</a> to approve and send.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Check-ins</CardTitle>
            <CardDescription>Status of care and recent updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Seen a doctor</span>
              <Badge variant={intake?.medical?.seenDoctor === "yes" ? "success" : "destructive"}>{intake?.medical?.seenDoctor === "yes" ? "Yes" : "No"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Last check-in</span>
              <Badge variant={checkins[0]?.dateISO ? "success" : "outline"}>{checkins[0]?.dateISO || "—"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Avg. pain (last 5)</span>
              <Badge variant={checkins.length ? (Math.round((checkins.slice(0, 5).reduce((a: number, b: any) => a + b.pain, 0) / Math.min(5, checkins.length)) * 10) / 10) >= 6 ? "warning" : "success" : "outline"}>
                {checkins.length ? Math.round((checkins.slice(0, 5).reduce((a: number, b: any) => a + b.pain, 0) / Math.min(5, checkins.length)) * 10) / 10 : "—"}
              </Badge>
            </div>
            <div className="pt-2">
              <Button asChild>
                <a href="/check-ins">Add Check-in</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
