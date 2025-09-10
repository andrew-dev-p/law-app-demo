"use client";

import { BackLink } from "@/components/app/back-link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

type Offer = { id: string; dateISO: string; from: "Insurer" | "Client"; amount: number; note?: string };

type LitigationState = {
  considerReasons: {
    lowOffer: boolean;
    disputedLiability: boolean;
    solSoon: boolean;
    coverageIssues: boolean;
    clientPreference: boolean;
  };
  solDate?: string;
  targetAmount?: number;
  clientConsent: boolean;
  clientNotes?: string;
  referred: boolean;
  referredAt?: string;
  firmName?: string;
  attorneyName?: string;
  attorneyEmail?: string;
  attorneyPhone?: string;
  venue?: string;
  defendants?: string;
};

const LKEY = "litigation-state";

export default function LitigationPage() {
  const [lit, setLit] = useState<LitigationState>({
    considerReasons: {
      lowOffer: false,
      disputedLiability: false,
      solSoon: false,
      coverageIssues: false,
      clientPreference: false,
    },
    clientConsent: false,
    referred: false,
  });

  const [offers, setOffers] = useState<Offer[]>([]);
  const [intakeStep, setIntakeStep] = useState<number>(0);
  const [providersCount, setProvidersCount] = useState<number>(0);
  const [uploadsCount, setUploadsCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(LKEY);
      if (raw) setLit({ ...lit, ...(JSON.parse(raw) as LitigationState) });
      const off = window.localStorage.getItem("negotiations-offers");
      if (off) setOffers(JSON.parse(off));
      const step = window.localStorage.getItem("intake-step");
      if (step) setIntakeStep(parseInt(step, 10) || 0);
      const prov = window.localStorage.getItem("bills-records-providers");
      if (prov) setProvidersCount((JSON.parse(prov) as any[]).length);
      const intake = window.localStorage.getItem("intake-state");
      if (intake) setUploadsCount((JSON.parse(intake).uploads?.length as number) || 0);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LKEY, JSON.stringify(lit));
  }, [lit]);

  const bestInsurer = useMemo(() => {
    return offers
      .filter((o) => o.from === "Insurer")
      .reduce((max, o) => (o.amount > (max?.amount ?? 0) ? o : max), undefined as Offer | undefined);
  }, [offers]);

  const daysToSOL = useMemo(() => {
    if (!lit.solDate) return null;
    const today = new Date();
    const sol = new Date(lit.solDate + "T00:00:00");
    const diff = Math.ceil((sol.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [lit.solDate]);

  const recommend = useMemo(() => {
    const lowOfferTrigger = !!(lit.targetAmount && bestInsurer && bestInsurer.amount < lit.targetAmount * 0.7);
    const solTrigger = daysToSOL != null && daysToSOL <= 30;
    const explicitReasons = lit.considerReasons.disputedLiability || lit.considerReasons.coverageIssues || lit.considerReasons.clientPreference;
    return lowOfferTrigger || solTrigger || explicitReasons || lit.considerReasons.lowOffer;
  }, [lit.targetAmount, bestInsurer, daysToSOL, lit.considerReasons]);

  const markReferred = () => {
    setLit((s) => ({ ...s, referred: true, referredAt: new Date().toISOString().slice(0, 10) }))
  };

  return (
    <div className="w-full p-6 space-y-6">
      <BackLink className="mb-3" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Litigation</h1>
          <p className="text-sm text-muted-foreground">Review options and, if needed, refer to litigation counsel.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={lit.referred ? "success" : "outline"}>{lit.referred ? `Referred (${lit.referredAt})` : "Not referred"}</Badge>
          <Badge variant={recommend ? "warning" : "outline"}>{recommend ? "Escalation recommended" : "Negotiation ongoing"}</Badge>
          <Badge variant={daysToSOL != null && daysToSOL <= 30 ? "destructive" : "outline"}>
            SOL {daysToSOL == null ? "вЂ”" : `${daysToSOL}d`}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why consider litigation?</CardTitle>
          <CardDescription>Select applicable reasons and key dates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {([
              ["lowOffer", "Low insurer offer"],
              ["disputedLiability", "Disputed liability / causation"],
              ["coverageIssues", "Coverage/policy issues"],
              ["clientPreference", "Client requests escalation"],
            ] as const).map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(lit.considerReasons as any)[key]}
                  onChange={(e) => setLit((s) => ({ ...s, considerReasons: { ...s.considerReasons, [key]: e.target.checked } }))}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="sol">Statute of limitations</Label>
              <DatePicker id="sol" value={lit.solDate ?? ""} onChange={(v) => setLit((s) => ({ ...s, solDate: v }))} />
              <div className="text-xs text-muted-foreground mt-1">{daysToSOL == null ? "" : `${daysToSOL} day(s) remaining`}</div>
            </div>
            <div>
              <Label htmlFor="target">Target resolution amount</Label>
              <Input
                id="target"
                placeholder="$50,000"
                value={lit.targetAmount?.toString() ?? ""}
                onChange={(e) => setLit((s) => ({ ...s, targetAmount: Number(e.target.value.replace(/[^0-9.]/g, "")) || undefined }))}
              />
              <div className="text-xs text-muted-foreground mt-1">Best insurer offer: {bestInsurer ? `$${bestInsurer.amount.toLocaleString()}` : "вЂ”"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Decision</CardTitle>
          <CardDescription>Capture consent and any notes before referral.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={lit.clientConsent} onChange={(e) => setLit((s) => ({ ...s, clientConsent: e.target.checked }))} />
            I consent to referral for litigation if negotiations do not resolve my case.
          </label>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Anything important to share with your litigation attorney?"
              value={lit.clientNotes ?? ""}
              onChange={(e) => setLit((s) => ({ ...s, clientNotes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attorney Referral</CardTitle>
          <CardDescription>Who should handle the litigation?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="firm">Firm</Label>
              <Input id="firm" value={lit.firmName ?? ""} onChange={(e) => setLit((s) => ({ ...s, firmName: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="attorney">Attorney</Label>
              <Input id="attorney" value={lit.attorneyName ?? ""} onChange={(e) => setLit((s) => ({ ...s, attorneyName: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={lit.attorneyEmail ?? ""} onChange={(e) => setLit((s) => ({ ...s, attorneyEmail: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={lit.attorneyPhone ?? ""} onChange={(e) => setLit((s) => ({ ...s, attorneyPhone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" placeholder="County / Court" value={lit.venue ?? ""} onChange={(e) => setLit((s) => ({ ...s, venue: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="defendants">Defendants</Label>
              <Input id="defendants" placeholder="Comma-separated" value={lit.defendants ?? ""} onChange={(e) => setLit((s) => ({ ...s, defendants: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={markReferred} disabled={!lit.clientConsent || lit.referred}>Mark Referred</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handoff Summary</CardTitle>
          <CardDescription>Snapshot of current case status for counsel.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div className="rounded-md border border-card-border p-3">
            <div className="text-muted-foreground">Intake</div>
            <div className="font-medium">{intakeStep >= 6 ? "Submitted" : "In progress"}</div>
          </div>
          <div className="rounded-md border border-card-border p-3">
            <div className="text-muted-foreground">Providers on file</div>
            <div className="font-medium">{providersCount}</div>
          </div>
          <div className="rounded-md border border-card-border p-3">
            <div className="text-muted-foreground">Client documents</div>
            <div className="font-medium">{uploadsCount}</div>
          </div>
          <div className="rounded-md border border-card-border p-3">
            <div className="text-muted-foreground">Best insurer offer</div>
            <div className="font-medium">{bestInsurer ? `$${bestInsurer.amount.toLocaleString()}` : "вЂ”"}</div>
          </div>
          <div className="rounded-md border border-card-border p-3">
            <div className="text-muted-foreground">Target amount</div>
            <div className="font-medium">{lit.targetAmount ? `$${lit.targetAmount.toLocaleString()}` : "вЂ”"}</div>
          </div>
          <div className="rounded-md border border-card-border p-3">
            <div className="text-muted-foreground">SOL</div>
            <div className="font-medium">{lit.solDate || "вЂ”"} {daysToSOL != null ? `(${daysToSOL}d)` : ""}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


