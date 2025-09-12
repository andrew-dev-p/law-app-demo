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
import { Trophy, CheckCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  cancelIncidentReminders,
  ensureIncidentRemindersScheduled,
} from "@/lib/reminders";
import {
  CityStep,
  StateStep,
  StreetStep,
  ZipStep,
} from "./_components/address-step";
import {
  AgreementSection,
  AgreementsForm,
} from "./_components/agreements-form";
import { DateOfBirthStep } from "./_components/date-of-birth-step";
import { EmailStep } from "./_components/email-step";
import { FullNameStep } from "./_components/full-name-step";
import { PhonesStep } from "./_components/phones-step";
import { SSNStep } from "./_components/ssn-step";
import { DriversLicenseStep } from "./_components/drivers-license-step";
import { FamilyStatusStep } from "./_components/family-status-step";
import { ChildrenStep } from "./_components/children-step";
import {
  IncidentDateStep,
  IncidentEmsHospitalStep,
  IncidentLocationPoliceStep,
  IncidentStateStep,
  IncidentTypeRolePolicyStep,
  IncidentVoiceTicketsStep,
} from "./_components/incident-details-steps";
import {
  MedicalInjuryVoiceStep,
  MedicalPreviousInjuryVoiceStep,
  MedicalProvidersStep,
} from "./_components/medical-details-steps";
import {
  InsuranceCompaniesStep,
  LostIncomeStep,
  HouseholdAndUMStep,
  OtherDriverInsurerStep,
} from "./_components/insurance-employment-steps";
import {
  BillsStep,
  OtherCostsStep,
  PropertyDamageStep,
} from "./_components/damages-steps";
import {
  AttorneyStep,
  WitnessesStep,
} from "./_components/witnesses-attorneys-steps";
import { ReviewSection } from "./_components/review-section";
import { StepHeader } from "./_components/step-header";
import { UploadSection, UploadsForm } from "./_components/uploads-form";
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

  // Mark setup as completed when user reaches intake page
  useEffect(() => {
    if (!user) return;
    const alreadyCompleted = Boolean(user?.unsafeMetadata?.setupCompleted);
    if (!alreadyCompleted) {
      const updateUser = async () => {
        try {
          await user.update({
            unsafeMetadata: {
              ...(user.unsafeMetadata || {}),
              setupCompleted: true,
            },
          });
        } catch {
          // Silently ignore errors
        }
      };
      updateUser();
    }
  }, [user]);

  // TODO: Remove localStorage for demo
  const [state, setState] = useState<IntakeState>(() => defaultState);

  // Load from localStorage on mount to avoid SSR/CSR mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("intake-state");
      const rawStep = window.localStorage.getItem("intake-step");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<IntakeState>;
        const parsedAgreements = parsed.agreements as
          | Partial<IntakeState["agreements"]>
          | undefined;
        const restored: IntakeState = {
          ...defaultState,
          ...parsed,
          personal: { ...defaultState.personal, ...(parsed.personal || {}) },
          incident: { ...defaultState.incident, ...(parsed.incident || {}) },
          medical: { ...defaultState.medical, ...(parsed.medical || {}) },
          agreements: {
            ...defaultState.agreements,
            ...(parsedAgreements || {}),
            hipaa: {
              ...defaultState.agreements.hipaa,
              ...(parsedAgreements?.hipaa || {}),
            },
            representation: {
              ...defaultState.agreements.representation,
              ...(parsedAgreements?.representation || {}),
            },
            fee: {
              ...defaultState.agreements.fee,
              ...(parsedAgreements?.fee || {}),
            },
          },
          uploads: Array.isArray(parsed.uploads)
            ? (parsed.uploads as UploadItem[])
            : [],
          agreed: Boolean(parsed.agreed),
        } as IntakeState;
        setState(restored);
      }
      if (rawStep) {
        const n = parseInt(rawStep, 10);
        if (!Number.isNaN(n)) setStep(n);
      }
    } catch {}
  }, []);

  // TODO: Remove localStorage for demo
  // Prefill from Clerk user/metadata (only fill empty fields)
  useEffect(() => {
    if (!user) return;
    const meta = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
    const asString = (v: unknown): string | undefined =>
      typeof v === "string" ? v : undefined;
    setState((s) => {
      const next = {
        firstName:
          s.personal.firstName ||
          asString(meta.contactFirstName) ||
          user.firstName ||
          "",
        lastName:
          s.personal.lastName ||
          asString(meta.contactLastName) ||
          user.lastName ||
          "",
        email:
          s.personal.email ||
          asString(meta.contactEmail) ||
          user.primaryEmailAddress?.emailAddress ||
          "",
        phoneMobile:
          s.personal.phoneMobile || asString(meta.contactPhone) || "",
        dob: s.personal.dob || asString(meta.contactDob) || "",
      };
      const unchanged =
        next.firstName === s.personal.firstName &&
        next.lastName === s.personal.lastName &&
        next.email === s.personal.email &&
        next.phoneMobile === s.personal.phoneMobile;
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

  const currentStepIsValid = useMemo(
    () => getCurrentStepValidation(state, step),
    [state, step]
  );

  const next = useCallback(() => {
    const nextStep = Math.min(step + 1, TOTAL_QUESTIONS);
    const completedSectionIndex = checkSectionCompletion(state, step, nextStep);

    if (completedSectionIndex !== null) {
      const sectionNames = [
        "Personal Info",
        "Family & Status",
        "Incident Details",
        "Medical Details",
        "Insurance & Employment",
        "Damages & Costs",
        "Witnesses & Attorneys",
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
      // 0: Full name
      () => (
        <FullNameStep
          firstName={state.personal.firstName}
          lastName={state.personal.lastName}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 1: DOB
      () => (
        <DateOfBirthStep
          dob={state.personal.dob}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 2: SSN
      () => (
        <SSNStep
          ssn={state.personal.ssn}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 3: Driver�s License
      () => (
        <DriversLicenseStep
          driversLicense={state.personal.driversLicense}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 4: Street
      () => (
        <StreetStep
          value={state.personal.addressStreet}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 5: City
      () => (
        <CityStep
          value={state.personal.addressCity}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 6: State
      () => (
        <StateStep
          value={state.personal.addressState}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 7: ZIP
      () => (
        <ZipStep
          value={state.personal.addressZip}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 8: Phones
      () => (
        <PhonesStep
          value={{
            phoneMobile: state.personal.phoneMobile,
            phoneHome: state.personal.phoneHome,
            phoneWork: state.personal.phoneWork,
          }}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 9: Email
      () => (
        <EmailStep
          email={state.personal.email}
          onChange={(data) =>
            setState((s) => ({ ...s, personal: { ...s.personal, ...data } }))
          }
        />
      ),
      // 10: Marital status
      () => (
        <FamilyStatusStep
          value={{
            maritalStatus: state.family.maritalStatus,
            spouseName: state.family.spouseName,
            spousePhone: state.family.spousePhone,
          }}
          onChange={(v) =>
            setState((s) => ({ ...s, family: { ...s.family, ...v } }))
          }
        />
      ),
      // 11: Children & companions
      () => (
        <ChildrenStep
          value={{
            numberOfChildren: state.family.numberOfChildren,
            childrenAges: state.family.childrenAges,
            minorCompanionsNames: state.family.minorCompanionsNames,
          }}
          onChange={(v) =>
            setState((s) => ({ ...s, family: { ...s.family, ...v } }))
          }
        />
      ),
      // 12: Incident Date
      () => (
        <IncidentDateStep
          value={state.incident.date}
          onChange={(v) =>
            setState((s) => ({ ...s, incident: { ...s.incident, ...v } }))
          }
        />
      ),
      // 13: Incident State
      () => (
        <IncidentStateStep
          value={state.incident.state}
          onChange={(v) =>
            setState((s) => ({ ...s, incident: { ...s.incident, ...v } }))
          }
        />
      ),
      // 14: Location & Police
      () => (
        <IncidentLocationPoliceStep
          value={{
            location: state.incident.location,
            policeDepartment: state.incident.policeDepartment,
            policeReportNumber: state.incident.policeReportNumber,
          }}
          onChange={(v) =>
            setState((s) => ({ ...s, incident: { ...s.incident, ...v } }))
          }
        />
      ),
      // 15: Accident Type & Role (+ own policy)
      () => (
        <IncidentTypeRolePolicyStep
          value={{
            accidentType: state.incident.accidentType,
            role: state.incident.role,
            hasOwnPolicy: state.incident.hasOwnPolicy,
          }}
          onChange={(v) =>
            setState((s) => ({ ...s, incident: { ...s.incident, ...v } }))
          }
        />
      ),
      // 16: EMS & Hospital
      () => (
        <IncidentEmsHospitalStep
          value={{
            emsAtScene: state.incident.emsAtScene,
            hospitalTransportedTo: state.incident.hospitalTransportedTo,
          }}
          onChange={(v) =>
            setState((s) => ({ ...s, incident: { ...s.incident, ...v } }))
          }
        />
      ),
      // 17: Incident Voice + Tickets
      () => (
        <IncidentVoiceTicketsStep
          value={{
            otherDriverTicket: state.incident.otherDriverTicket,
            otherDriverTicketWhyNot: state.incident.otherDriverTicketWhyNot,
            clientTicket: state.incident.clientTicket,
            clientTicketWhy: state.incident.clientTicketWhy,
          }}
          transcript={state.incident.transcript}
          onSave={(t) =>
            setState((s) => ({
              ...s,
              incident: { ...s.incident, transcript: t },
            }))
          }
          onChange={(v) =>
            setState((s) => ({ ...s, incident: { ...s.incident, ...v } }))
          }
        />
      ),
      // 18: Medical Injury Voice
      () => (
        <MedicalInjuryVoiceStep
          transcript={state.medical.transcript}
          onSave={(t) =>
            setState((s) => ({
              ...s,
              medical: { ...s.medical, transcript: t },
            }))
          }
        />
      ),
      // 19: Previous Injury Voice
      () => (
        <MedicalPreviousInjuryVoiceStep
          previousTranscript={state.medical.previousInjuryTranscript}
          onSave={(t) =>
            setState((s) => ({
              ...s,
              medical: { ...s.medical, previousInjuryTranscript: t },
            }))
          }
        />
      ),
      // 20: Providers
      () => (
        <MedicalProvidersStep
          value={state.medical.providers}
          onChange={(providers) =>
            setState((s) => ({ ...s, medical: { ...s.medical, providers } }))
          }
        />
      ),
      // 21: Insurance companies
      () => (
        <InsuranceCompaniesStep
          value={state.insuranceEmployment.insuranceCompanies}
          onChange={(insuranceCompanies) =>
            setState((s) => ({
              ...s,
              insuranceEmployment: {
                ...s.insuranceEmployment,
                insuranceCompanies,
              },
            }))
          }
        />
      ),
      // 22: Other driver insurer
      () => (
        <OtherDriverInsurerStep
          value={state.insuranceEmployment.otherDriverInsuranceCompany}
          onChange={(v) =>
            setState((s) => ({
              ...s,
              insuranceEmployment: { ...s.insuranceEmployment, ...v },
            }))
          }
        />
      ),
      // 23: Household policies + UM claim
      () => (
        <HouseholdAndUMStep
          value={{
            householdPolicies: state.insuranceEmployment.householdPolicies,
            permissionOpenUmClaim:
              state.insuranceEmployment.permissionOpenUmClaim,
            umInsuranceCompany: state.insuranceEmployment.umInsuranceCompany,
          }}
          onChange={(v) =>
            setState((s) => ({
              ...s,
              insuranceEmployment: { ...s.insuranceEmployment, ...v },
            }))
          }
        />
      ),
      // 24: Lost income
      () => (
        <LostIncomeStep
          value={{
            lostIncomeOrMissedWork:
              state.insuranceEmployment.lostIncomeOrMissedWork,
            employerPhone: state.insuranceEmployment.employerPhone,
            employerAddress: state.insuranceEmployment.employerAddress,
          }}
          onChange={(v) =>
            setState((s) => ({
              ...s,
              insuranceEmployment: { ...s.insuranceEmployment, ...v },
            }))
          }
        />
      ),
      // 25: Property damage
      () => (
        <PropertyDamageStep
          value={state.damages}
          onChange={(v) =>
            setState((s) => ({ ...s, damages: { ...s.damages, ...v } }))
          }
        />
      ),
      // 26: Bills
      () => (
        <BillsStep
          value={state.damages}
          onChange={(v) =>
            setState((s) => ({ ...s, damages: { ...s.damages, ...v } }))
          }
        />
      ),
      // 27: Other costs
      () => (
        <OtherCostsStep
          value={state.damages}
          onChange={(v) =>
            setState((s) => ({ ...s, damages: { ...s.damages, ...v } }))
          }
        />
      ),
      // 28: Witnesses
      () => (
        <WitnessesStep
          value={state.witnessesAttorneys.witnesses}
          onChange={(v) =>
            setState((s) => ({
              ...s,
              witnessesAttorneys: { ...s.witnessesAttorneys, ...v },
            }))
          }
        />
      ),
      // 29: Attorney
      () => (
        <AttorneyStep
          value={{
            spokeToAnotherAttorney:
              state.witnessesAttorneys.spokeToAnotherAttorney,
            attorneyNameAddress: state.witnessesAttorneys.attorneyNameAddress,
          }}
          onChange={(v) =>
            setState((s) => ({
              ...s,
              witnessesAttorneys: { ...s.witnessesAttorneys, ...v },
            }))
          }
        />
      ),
      // 30..32: Uploads
      () => (
        <UploadsForm
          section={UploadSection.License}
          uploads={state.uploads}
          onUpload={onFileUpload}
          onRemove={removeUpload}
        />
      ),
      () => (
        <UploadsForm
          section={UploadSection.Insurance}
          uploads={state.uploads}
          onUpload={onFileUpload}
          onRemove={removeUpload}
        />
      ),
      () => (
        <UploadsForm
          section={UploadSection.Evidence}
          uploads={state.uploads}
          onUpload={onFileUpload}
          onRemove={removeUpload}
        />
      ),
      // 33..35: Agreements
      () => (
        <AgreementsForm
          section={AgreementSection.Hipaa}
          value={state.agreements}
          onChange={(agreements) => setState((s) => ({ ...s, agreements }))}
        />
      ),
      () => (
        <AgreementsForm
          section={AgreementSection.Representation}
          value={state.agreements}
          onChange={(agreements) => setState((s) => ({ ...s, agreements }))}
        />
      ),
      () => (
        <AgreementsForm
          section={AgreementSection.Fee}
          value={state.agreements}
          onChange={(agreements) => setState((s) => ({ ...s, agreements }))}
        />
      ),
      // 36: Review & Submit
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
    toast.success("Intake Submitted", {
      description: "Thanks! We'll review and follow up shortly.",
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 3000,
      position: "bottom-center",
    });
  };

  // Schedule reminders if incident voice not completed (question 17)
  useEffect(() => {
    if (step === 17 || (step === 18 && !state.incident.transcript?.trim())) {
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

      if (!isLastStep && currentStepIsValid) {
        e.preventDefault();
        next();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, state, next, isLastStep, currentStepIsValid]);

  // Debug: uncomment for local troubleshooting of validation per step
  // console.log(step, currentStepIsValid);

  return (
    <div className="w-full p-6 relative">
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
            if (!isLastStep) {
              return (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    Press <span className="font-bold">Enter</span> to continue
                  </p>
                  <Button onClick={next} disabled={!currentStepIsValid}>
                    Continue
                  </Button>
                </div>
              );
            }
            return (
              <Button onClick={submit} disabled={!currentStepIsValid}>
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
