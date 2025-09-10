"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckIcon } from "lucide-react";

type IntakeState = {
  personal: { firstName: string; lastName: string; email: string };
  incident: { date: string; type: string };
  medical: {
    seenDoctor: "yes" | "no" | "";
    injuries: string[];
    needReferral: boolean;
  };
  uploads: { id: string }[];
  agreed: boolean;
};

export default function DashboardPage() {
  const [intake, setIntake] = useState<IntakeState | null>(null);
  const [intakeStep, setIntakeStep] = useState<number>(0);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [demand, setDemand] = useState<{
    draftReady: boolean;
    approved: boolean;
  } | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [litigation, setLitigation] = useState<any>(null);

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
        const o = window.localStorage.getItem("negotiations-offers");
        if (o) setOffers(JSON.parse(o));
        const s = window.localStorage.getItem("settlement-state");
        if (s) setSettlement(JSON.parse(s));
        const l = window.localStorage.getItem("litigation-state");
        if (l) setLitigation(JSON.parse(l));
      } catch {}
    }
  }, []);

  // Checklist steps
  const steps = useMemo(() => {
    const intakeDone = intakeStep >= 6;
    const checkinDone = false;
    const providersOrDocs =
      (providers?.length ?? 0) > 0 || (intake?.uploads?.length ?? 0) > 0;
    const demandDraft = !!demand?.draftReady;
    const demandApproved = !!demand?.approved;
    const counterSent = offers?.some((o) => o.from === "Client");
    const settlementInProgress =
      !!settlement?.fundsReceived || !!settlement?.releaseSigned;
    const settlementDone = !!settlement?.fundsReceived;
    const litigationReferred = !!litigation?.referred;
    return [
      {
        id: "intake",
        title: "Complete your intake",
        desc: "Tell us about you and the incident.",
        href: "/intake",
        done: intakeDone,
      },
      {
        id: "checkins",
        title: "Add a medical check-in",
        desc: "Log your pain level, visits, and notes.",
        href: "/check-ins",
        done: checkinDone,
      },
      {
        id: "providers",
        title: "Add providers and docs",
        desc: "List your treatment providers and upload bills/records.",
        href: "/bills-records",
        done: providersOrDocs,
      },
      {
        id: "demandDraft",
        title: "Generate demand draft",
        desc: "Prepare a draft demand to the insurer.",
        href: "/demand-review",
        done: demandDraft,
      },
      {
        id: "demandApprove",
        title: "Approve demand to send",
        desc: "Review the draft and approve for sending.",
        href: "/demand-review",
        done: demandApproved,
      },
      {
        id: "negotiations",
        title: "Review offer and send counter",
        desc: "Track offers and propose a counter if needed.",
        href: "/negotiations",
        done: counterSent,
      },
      {
        id: "settlement",
        title: "Finalize settlement",
        desc: "Sign release, record funds, and pay providers.",
        href: "/settlement",
        done: settlementDone,
        inProgress: settlementInProgress && !settlementDone,
      },
      {
        id: "litigation",
        title: "Consider litigation (if needed)",
        desc: "Review options and refer to litigation.",
        href: "/litigation",
        done: litigationReferred,
        optional: true,
      },
    ];
  }, [
    intake,
    intakeStep,
    checkins,
    providers,
    demand,
    offers,
    settlement,
    litigation,
  ]);

  const counts = useMemo(() => {
    const required = steps.filter((s) => !s.optional);
    const done = required.filter((s) => s.done).length;
    const percent = Math.round((done / required.length) * 100);
    const currentIndex = required.findIndex((s) => !s.done);
    const current = currentIndex === -1 ? required.length - 1 : currentIndex;
    return {
      done,
      total: required.length,
      percent,
      currentIndex: currentIndex === -1 ? required.length : currentIndex,
    };
  }, [steps]);

  const currentStepIndex = counts.currentIndex;

  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your Case Checklist</h1>
        <p className="text-sm text-muted-foreground">
          Follow the steps below. We&apos;ll guide you through each one.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
          <CardDescription>
            Complete the current step; the next one will appear.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-md border border-card-border p-3 bg-card">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {counts.done} of {counts.total} | {counts.percent}%
              </span>
            </div>
            <Progress value={counts.percent} className="h-2" />
          </div>
          <ul className="space-y-2">
            {steps.map((s, i) => {
              const isCurrent = i === currentStepIndex;
              return (
                <li
                  key={s.id}
                  className="rounded-md border border-card-border overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                          s.done
                            ? "bg-[hsl(var(--success))] text-white border-transparent"
                            : isCurrent
                            ? "border-[hsl(var(--primary))]"
                            : "border-border"
                        }`}
                      >
                        {s.done ? <CheckIcon className="h-4 w-4" /> : i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium">
                          {s.title}
                          {s.optional ? " (optional)" : ""}
                        </div>
                        {!isCurrent && (
                          <div className="text-xs text-muted-foreground">
                            {s.done ? "Completed" : "Pending"}
                          </div>
                        )}
                      </div>
                    </div>
                    {!s.done && !isCurrent && (
                      <a
                        href={s.href}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Open
                      </a>
                    )}
                  </div>
                  {isCurrent && !s.done && (
                    <div className="border-t border-card-border px-3 py-3 bg-card">
                      <p className="text-sm text-muted-foreground mb-3">
                        {s.desc}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button asChild>
                          <a href={s.href}>Go to {s.title.split(" ")[0]}</a>
                        </Button>
                        {i + 1 < steps.length && (
                          <span className="text-xs text-muted-foreground">
                            Next up: {steps[i + 1].title}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
