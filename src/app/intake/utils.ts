import { type IntakeState } from "./model";
import {
  fullNameSchema,
  emailSchema,
  phoneSchema,
  dateOfBirthSchema,
  addressStreetSchema,
  addressCitySchema,
  addressStateSchema,
  addressZipSchema,
} from "./validation";

// Utility function to split full name into first and last name
export const splitFullName = (
  fullName: string
): { firstName: string; lastName: string } => {
  const words = fullName.trim().split(/\s+/);
  if (words.length === 2) {
    return {
      firstName: words[0],
      lastName: words[1],
    };
  }
  // Fallback if validation somehow fails
  return {
    firstName: words[0] || "",
    lastName: words.slice(1).join(" ") || "",
  };
};

export const STEP_TITLES = [
  "What is your name?",
  "What's the best email to reach you?",
  "What's the best phone number to reach you?",
  "What is your date of birth?",
  "What is your street address?",
  "What city do you live in?",
  "What state do you live in?",
  "What is your ZIP code?",
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
  // Validation functions using Zod schemas
  const validateFullName = () => {
    const fullName = [state.personal.firstName, state.personal.lastName]
      .filter(Boolean)
      .join(" ");
    return fullNameSchema.safeParse({ fullName }).success;
  };

  const validateEmail = () => {
    return emailSchema.safeParse({ email: state.personal.email }).success;
  };

  const validatePhone = () => {
    return phoneSchema.safeParse({ phone: state.personal.phone }).success;
  };

  const validateDateOfBirth = () => {
    return dateOfBirthSchema.safeParse({ dob: state.personal.dob }).success;
  };

  const validateAddressStreet = () => {
    return addressStreetSchema.safeParse({ addressStreet: state.personal.addressStreet }).success;
  };
  const validateAddressCity = () => {
    return addressCitySchema.safeParse({ addressCity: state.personal.addressCity }).success;
  };
  const validateAddressState = () => {
    return addressStateSchema.safeParse({ addressState: state.personal.addressState }).success;
  };
  const validateAddressZip = () => {
    return addressZipSchema.safeParse({ addressZip: state.personal.addressZip }).success;
  };

  const docHas = (cat: "license" | "insurance" | "evidence") =>
    state.uploads.some((u) => u.category === cat);
  const agreeOk = (k: "hipaa" | "representation" | "fee") => {
    const a = state.agreements[k];
    return Boolean(a.initials && a.date && a.agreed);
  };

  return [
    // Personal Information Section
    validateFullName(), // Step 0: Full name (exactly 2 words: first + last)
    validateEmail(), // Step 1: Email address (valid email format)
    validatePhone(), // Step 2: Phone number (US format validation)
    validateDateOfBirth(), // Step 3: Date of birth (18-120 years old)
    validateAddressStreet(), // Step 4: Street
    validateAddressCity(), // Step 5: City
    validateAddressState(), // Step 6: State
    validateAddressZip(), // Step 7: ZIP

    // Incident & Medical Information Section
    Boolean(state.incident.transcript && state.incident.transcript.trim()), // Step 8: Incident details voice recording
    Boolean(state.medical.transcript && state.medical.transcript.trim()), // Step 9: Medical/referral voice recording

    // Document Upload Section
    docHas("license"), // Step 10: Driver's license upload
    docHas("insurance"), // Step 11: Insurance cards upload
    docHas("evidence"), // Step 12: Accident/injury photos upload

    // Legal Agreements Section
    agreeOk("hipaa"), // Step 13: HIPAA release agreement signed
    agreeOk("representation"), // Step 14: Legal representation agreement signed
    agreeOk("fee"), // Step 15: Contingency fee agreement signed

    // Final Review & Submission
    Boolean(state.agreed), // Step 16: Final agreement to submit intake
  ];
};

export const getCurrentStepValidation = (state: IntakeState, step: number) => {
  const validList = getValidationList(state);
  return validList[Math.min(step, validList.length - 1)];
};

// Constants for questionnaire flow
export const TOTAL_QUESTIONS = 17;
export const SECTION_STARTS = [0, 8, 9, 10, 13, 16];

// Helper functions for step state computation
export const getSectionFromQuestion = (q: number) => {
  if (q >= 16) return 5;
  if (q >= 13) return 4;
  if (q >= 10) return 3;
  if (q >= 9) return 2;
  if (q >= 8) return 1;
  return 0;
};

export const isQuestionnaireActive = (step: number) => step < TOTAL_QUESTIONS;
export const isQuestionnaireComplete = (step: number) =>
  step >= TOTAL_QUESTIONS;
export const isLastStep = (step: number) => step === TOTAL_QUESTIONS - 1;

export const getProgress = (step: number) =>
  ((Math.min(step, TOTAL_QUESTIONS - 1) + 1) / TOTAL_QUESTIONS) * 100;

export const getCompletedSteps = (
  state: IntakeState,
  currentStep: number
): number[] => {
  const validList = getValidationList(state);
  const completed: number[] = [];

  // Check each section's completion
  const sections = [
    // Personal section (steps 0-7)
    { start: 0, end: 7, sectionIndex: 0 },
    // Incident section (step 8)
    { start: 8, end: 8, sectionIndex: 1 },
    // Medical section (step 9)
    { start: 9, end: 9, sectionIndex: 2 },
    // Uploads section (steps 10-12)
    { start: 10, end: 12, sectionIndex: 3 },
    // Agreements section (steps 13-15)
    { start: 13, end: 15, sectionIndex: 4 },
    // Review section (step 16)
    { start: 16, end: 16, sectionIndex: 5 },
  ];

  sections.forEach(({ start, end, sectionIndex }) => {
    // Check if all steps in this section are valid
    const sectionSteps = validList.slice(start, end + 1);
    const isSectionComplete = sectionSteps.every((valid) => valid === true);

    // Also check if we've moved past this section
    const isPastSection = currentStep > end;

    if (isSectionComplete && isPastSection) {
      completed.push(sectionIndex);
    }
  });

  return completed;
};

// Check if moving to nextStep will complete a new section
export const checkSectionCompletion = (
  state: IntakeState,
  currentStep: number,
  nextStep: number
): number | null => {
  const validList = getValidationList(state);

  // Check each section's completion
  const sections = [
    // Personal section (steps 0-7)
    { start: 0, end: 7, sectionIndex: 0 },
    // Incident section (step 8)
    { start: 8, end: 8, sectionIndex: 1 },
    // Medical section (step 9)
    { start: 9, end: 9, sectionIndex: 2 },
    // Uploads section (steps 10-12)
    { start: 10, end: 12, sectionIndex: 3 },
    // Agreements section (steps 13-15)
    { start: 13, end: 15, sectionIndex: 4 },
    // Review section (step 16)
    { start: 16, end: 16, sectionIndex: 5 },
  ];

  for (const { start, end, sectionIndex } of sections) {
    // Check if nextStep is the step that completes this section
    if (nextStep > end && currentStep <= end) {
      const sectionSteps = validList.slice(start, end + 1);
      const isSectionComplete = sectionSteps.every((valid) => valid === true);

      if (isSectionComplete) {
        return sectionIndex;
      }
    }
  }

  return null;
};
