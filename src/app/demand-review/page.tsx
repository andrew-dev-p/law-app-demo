"use client";

import { BackLink } from "@/components/app/back-link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DemandState = { draftReady: boolean; approved: boolean; approvedAt?: string };
const KEY = "demand-state";

export default function DemandReviewPage() {
  const [demand, setDemand] = useState<DemandState>({ draftReady: false, approved: false });
  const [intakeStep, setIntakeStep] = useState(0);
  const [intake, setIntake] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setDemand(JSON.parse(raw));
      const s = window.localStorage.getItem("intake-step");
      if (s) setIntakeStep(parseInt(s, 10) || 0);
      const i = window.localStorage.getItem("intake-state");
      if (i) setIntake(JSON.parse(i));
      const p = window.localStorage.getItem("bills-records-providers");
      if (p) setProviders(JSON.parse(p));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(demand));
  }, [demand]);

  const prereqs = useMemo(() => {
    const intakeSubmitted = intakeStep >= 6;
    const anyRecords = providers.some((p) => p.recordsReceived);
    const anyBills = providers.some((p) => p.billsReceived) || (intake?.uploads?.length ?? 0) > 0;
    return {
      intakeSubmitted,
      anyRecords,
      anyBills,
      ready: intakeSubmitted && (anyRecords || anyBills),
    };
  }, [intakeStep, providers, intake]);

  const generateDraft = () => setDemand((d) => ({ ...d, draftReady: true }));
  const approve = () => setDemand((d) => ({ ...d, approved: true, approvedAt: new Date().toISOString() }));
  const reset = () => setDemand({ draftReady: false, approved: false });

  return (
    <div className="w-full p-6 space-y-6">
      <BackLink className="mb-3" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Demand Review</h1>
          <p className="text-sm text-muted-foreground">Prepare, review, and approve the demand to send to the insurer.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={demand.draftReady ? "success" : "outline"}>Draft {demand.draftReady ? "Ready" : "Pending"}</Badge>
          <Badge variant={demand.approved ? "success" : "outline"}>Approved {demand.approved ? "Yes" : "No"}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>These help ensure the demand is well-supported.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-md border border-card-border px-3 py-2">
            <span>Intake submitted</span>
            <Badge variant={prereqs.intakeSubmitted ? "success" : "destructive"}>{prereqs.intakeSubmitted ? "Yes" : "No"}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-card-border px-3 py-2">
            <span>Any medical records received</span>
            <Badge variant={prereqs.anyRecords ? "success" : "destructive"}>{prereqs.anyRecords ? "Yes" : "No"}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-card-border px-3 py-2">
            <span>Any bills or documents on file</span>
            <Badge variant={prereqs.anyBills ? "success" : "destructive"}>{prereqs.anyBills ? "Yes" : "No"}</Badge>
          </div>
          <div className="flex justify-end pt-2">
            {!demand.draftReady ? (
              <Button onClick={generateDraft} disabled={!prereqs.ready}>Generate Draft</Button>
            ) : !demand.approved ? (
              <Button onClick={approve}>Approve to Send</Button>
            ) : (
              <Button variant="secondary" onClick={reset}>Reset</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {demand.draftReady && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Preview</CardTitle>
            <CardDescription>Summary for demo purposes, not legally binding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-card-border p-3">
              <div className="font-medium">Insured demand letter</div>
              <div className="text-muted-foreground mt-1">
                Claimant: {intake?.personal?.firstName} {intake?.personal?.lastName || "вЂ”"}. Incident type: {intake?.incident?.type || "вЂ”"} on {intake?.incident?.date || "вЂ”"}.
                Treatment ongoing. Providers: {providers.length || 0}. Attached docs: {(intake?.uploads?.length || 0)}.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


