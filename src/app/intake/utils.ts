import { type IntakeState } from "./model";

export const STEP_TITLES = [
  "What is your name?",
  "What's the best email to reach you?",
  "What's the best phone number to reach you?",
  "What is your date of birth?",
  "What is your current address?",
  "Tell us about the incident (voice)",
  "Tell us about medical and referrals (voice)",
  "Upload driver's license",
  "Upload insurance cards",
  "Upload accident/injury photos",
  "Sign HIPAA release",
  "Sign representation agreement",
  "Sign contingency fee agreement",
  "Review & Submit",
];

export const getValidationList = (state: IntakeState) => {
  const hasPersonalName =
    state.personal.firstName.trim() && state.personal.lastName.trim();
  const docHas = (cat: "license" | "insurance" | "evidence") =>
    state.uploads.some((u) => u.category === cat);
  const agreeOk = (k: "hipaa" | "representation" | "fee") => {
    const a = state.agreements[k];
    return Boolean(a.initials && a.date && a.agreed);
  };

  return [
    Boolean(hasPersonalName),
    Boolean(state.personal.email.trim()),
    true, // phone is optional
    true, // dob is optional
    true, // address is optional
    Boolean(state.incident.transcript && state.incident.transcript.trim()),
    Boolean(state.medical.transcript && state.medical.transcript.trim()),
    docHas("license"),
    docHas("insurance"),
    docHas("evidence"),
    agreeOk("hipaa"),
    agreeOk("representation"),
    agreeOk("fee"),
    Boolean(state.agreed),
  ];
};

export const getCurrentStepValidation = (state: IntakeState, step: number) => {
  const validList = getValidationList(state);
  return validList[Math.min(step, validList.length - 1)];
};

// Constants for questionnaire flow
export const TOTAL_QUESTIONS = 14;
export const SECTION_STARTS = [0, 5, 6, 7, 10, 13];

// Helper functions for step state computation
export const getSectionFromQuestion = (q: number) => {
  if (q >= 13) return 5;
  if (q >= 10) return 4;
  if (q >= 7) return 3;
  if (q >= 6) return 2;
  if (q >= 5) return 1;
  return 0;
};

export const isQuestionnaireActive = (step: number) => step < TOTAL_QUESTIONS;
export const isQuestionnaireComplete = (step: number) =>
  step >= TOTAL_QUESTIONS;
export const isLastStep = (step: number) => step === TOTAL_QUESTIONS - 1;

export const getProgress = (step: number) =>
  ((Math.min(step, TOTAL_QUESTIONS - 1) + 1) / TOTAL_QUESTIONS) * 100;
