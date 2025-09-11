"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  IncidentReminders,
  getIncidentReminders,
  materializeIncidentReminders,
} from "@/lib/reminders";
import { useRef } from "react";
import { toast } from "sonner";

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
  const [providers, setProviders] = useState<any[]>([]);
  const [demand, setDemand] = useState<{
    draftReady: boolean;
    approved: boolean;
  } | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [litigation, setLitigation] = useState<any>(null);
  const [incidentReminders, setIncidentReminders] =
    useState<IncidentReminders | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("intake-state");
        const rawStep = window.localStorage.getItem("intake-step");
        if (raw) setIntake(JSON.parse(raw));
        if (rawStep) setIntakeStep(parseInt(rawStep, 10) || 0);
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
        setIncidentReminders(
          materializeIncidentReminders(getIncidentReminders())
        );
      } catch {}
    }
  }, []);

  // Tick reminder statuses occasionally
  useEffect(() => {
    const id = setInterval(() => {
      const next = materializeIncidentReminders();
      if (next) setIncidentReminders(next);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Toast on status change
  const prevRemRef = useRef<IncidentReminders | null>(null);
  useEffect(() => {
    if (!incidentReminders) return;
    const prev = prevRemRef.current;
    if (
      prev &&
      prev.sms.status !== incidentReminders.sms.status &&
      incidentReminders.sms.status === "sent"
    ) {
      toast.success("SMS reminder sent");
    }
    if (
      prev &&
      prev.call.status !== incidentReminders.call.status &&
      incidentReminders.call.status === "completed"
    ) {
      toast.success("Phone call reminder completed");
    }
    prevRemRef.current = incidentReminders;
  }, [incidentReminders]);

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
  }, [intake, intakeStep, providers, demand, offers, settlement, litigation]);

  const counts = useMemo(() => {
    const required = steps.filter((s) => !s.optional);
    const done = required.filter((s) => s.done).length;
    const percent = Math.round((done / required.length) * 100);
    const currentIndex = required.findIndex((s) => !s.done);
    return {
      done,
      total: required.length,
      percent,
      currentIndex: currentIndex === -1 ? required.length : currentIndex,
    };
  }, [steps]);

  const firstIncompleteIndex = useMemo(
    () => steps.findIndex((s) => !s.optional && !s.done),
    [steps]
  );
  const currentStep =
    firstIncompleteIndex === -1 ? null : steps[firstIncompleteIndex];
  const completedSteps = useMemo(() => steps.filter((s) => s.done), [steps]);
  const upcomingSteps = useMemo(
    () => steps.filter((s, idx) => !s.done && idx !== firstIncompleteIndex),
    [steps, firstIncompleteIndex]
  );

  return (
    <motion.div
      className="w-full p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold">Your Case Checklist</h1>
        <p className="text-sm text-muted-foreground">
          Follow the steps below. We&apos;ll guide you through each one.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <CardTitle className="text-lg">Steps</CardTitle>
              <CardDescription className="text-sm">
                Complete the current step; the next one will appear.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <CardContent>
              <motion.div
                className="mb-4 rounded-md border border-card-border p-3 bg-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>
                    {counts.done} of {counts.total} | {counts.percent}%
                  </span>
                </div>
                <Progress value={counts.percent} className="h-2" />
              </motion.div>

              {/* Current step spotlight */}
              {currentStep && (
                <motion.div
                  className="rounded-md border border-[hsl(var(--primary))] bg-card shadow-sm lightblue-glow cursor-pointer transition hover:bg-primary/2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  onClick={() => {
                    window.location.href = currentStep.href;
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs border-[hsl(var(--primary))]">
                        {firstIncompleteIndex + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">
                          {currentStep.title}
                          {currentStep.optional ? " (optional)" : ""}
                          <span className="ml-2 text-xs text-primary align-middle">
                            Current
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {currentStep.desc}
                        </p>
                        {currentStep.id === "intake" &&
                          incidentReminders?.enabled && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              <Badge variant="outline">
                                Incident voice reminder (SMS):{" "}
                                {incidentReminders.sms.status}
                              </Badge>
                              <Badge variant="outline">
                                Incident voice reminder (Call):{" "}
                                {incidentReminders.call.status}
                              </Badge>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-card-border px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Button asChild>
                        <a href={currentStep.href}>
                          Go to {currentStep.title.split(" ")[0]}
                        </a>
                      </Button>
                      {firstIncompleteIndex + 1 < steps.length && (
                        <span className="text-xs text-muted-foreground">
                          Next up: {steps[firstIncompleteIndex + 1].title}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Completed accordion */}
              {completedSteps.length > 0 && (
                <motion.div
                  className="mt-6 space-y-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Completed
                  </h3>
                  <Accordion type="multiple" className="w-full">
                    {completedSteps.map((s) => {
                      const index = steps.findIndex((x) => x.id === s.id);
                      return (
                        <AccordionItem key={s.id} value={s.id}>
                          <AccordionTrigger>
                            <div className="flex w-full items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs bg-[hsl(var(--success))] text-white border-transparent">
                                  <CheckIcon className="h-4 w-4" />
                                </span>
                                <div className="text-sm font-medium">
                                  {s.title}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Step {index + 1}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            <div className="px-1 text-sm text-muted-foreground">
                              Completed
                            </div>
                            <Button asChild>
                              <a href={s.href}>Open</a>
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </motion.div>
              )}

              {/* Upcoming accordion */}
              {upcomingSteps.length > 0 && (
                <motion.div
                  className="mt-6 space-y-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Upcoming
                  </h3>
                  <Accordion type="multiple" className="w-full">
                    {upcomingSteps.map((s) => {
                      const index = steps.findIndex((x) => x.id === s.id);
                      return (
                        <AccordionItem key={s.id} value={s.id}>
                          <AccordionTrigger>
                            <div className="flex w-full items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs border-border">
                                  {index + 1}
                                </span>
                                <div className="text-sm font-medium">
                                  {s.title}
                                  {s.optional ? " (optional)" : ""}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Pending
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-1">
                              <p className="text-sm text-muted-foreground mb-3">
                                {s.desc}
                              </p>
                              {s.id === "intake" &&
                                incidentReminders?.enabled && (
                                  <div className="mb-3 flex flex-wrap gap-1">
                                    <Badge variant="outline">
                                      Incident voice reminder (SMS):{" "}
                                      {incidentReminders.sms.status}
                                    </Badge>
                                    <Badge variant="outline">
                                      Incident voice reminder (Call):{" "}
                                      {incidentReminders.call.status}
                                    </Badge>
                                  </div>
                                )}
                              <Button asChild>
                                <a href={s.href}>Open</a>
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        </Card>
      </motion.div>

      {/* Removed separate Incident Follow-up card; statuses are shown inline on the intake step. */}
    </motion.div>
  );
}
