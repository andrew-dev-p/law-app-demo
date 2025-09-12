import { type IntakeState } from "./model";
import {
  fullNameSchema,
  emailSchema,
  dateOfBirthSchema,
  addressStreetSchema,
  addressCitySchema,
  addressStateSchema,
  addressZipSchema,
  ssnSchema,
  driversLicenseSchema,
  phonesSchema,
  maritalStatusSchema,
  childrenInfoSchema,
  incidentDateSchema,
  incidentStateSchema,
  incidentLocationPoliceSchema,
  incidentTypeRolePolicySchema,
  incidentEmsHospitalSchema,
  incidentVoiceAndTicketsSchema,
  medicalInjuryVoiceSchema,
  medicalPreviousInjuryVoiceSchema,
  medicalProvidersSchema,
  insuranceCompaniesSchema,
  otherDriverInsuranceSchema,
  householdAndUmSchema,
  employmentLossSchema,
  damagesPropertySchema,
  damagesBillsSchema,
  damagesOtherCostsSchema,
  witnessesSchema,
  attorneySchema,
} from "./validation";
import {
  User,
  Users,
  AlertTriangle,
  Heart,
  Shield,
  DollarSign,
  Gavel,
  FileText,
  FileCheck,
  CheckCircle,
} from "lucide-react";

// Icon mapping for step badges
export const STEP_ICONS = {
  personal: User,
  family: Users,
  incident: AlertTriangle,
  medical: Heart,
  insurance: Shield,
  damages: DollarSign,
  witnesses: Gavel,
  uploads: FileText,
  agreements: FileCheck,
  review: CheckCircle,
} as const;

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
  // Personal (10)
  "What is your name?",
  "What is your date of birth?",
  "What is your Social Security Number?",
  "What is your Driver’s License number?",
  "What is your street address?",
  "What city do you live in?",
  "What state do you live in?",
  "What is your ZIP code?",
  "Your phones (mobile/home/work)",
  "What's the best email to reach you?",
  // Family & Status (2)
  "Marital status",
  "Children & companions (optional)",
  // Incident (6)
  "Date of accident",
  "State of accident",
  "Location & police details",
  "Accident type & your role",
  "EMS at scene?",
  "Incident description + tickets",
  // Medical (3)
  "Injury description (voice)",
  "Previous injury history (voice)",
  "Treating providers (at least one)",
  // Insurance & Employment (4)
  "Insurance companies involved (at least one)",
  "AF (other driver) insurer",
  "Household policies + UM claim",
  "Lost income/missed work",
  // Damages & Costs (3)
  "Property damage",
  "Bills",
  "Other medical costs",
  // Witnesses & Attorneys (2)
  "Witnesses (optional)",
  "Spoke to another attorney?",
  // Documents (3)
  "Upload driver's license",
  "Upload insurance cards",
  "Upload accident/injury photos",
  // Agreements (3)
  "Sign HIPAA release",
  "Sign representation agreement",
  "Sign contingency fee agreement",
  // Review (1)
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

  const validateDateOfBirth = () => {
    return dateOfBirthSchema.safeParse({ dob: state.personal.dob }).success;
  };

  const validateAddressStreet = () => {
    return addressStreetSchema.safeParse({
      addressStreet: state.personal.addressStreet,
    }).success;
  };
  const validateAddressCity = () => {
    return addressCitySchema.safeParse({
      addressCity: state.personal.addressCity,
    }).success;
  };
  const validateAddressState = () => {
    return addressStateSchema.safeParse({
      addressState: state.personal.addressState,
    }).success;
  };
  const validateAddressZip = () => {
    return addressZipSchema.safeParse({ addressZip: state.personal.addressZip })
      .success;
  };

  const validateSSN = () =>
    ssnSchema.safeParse({ ssn: state.personal.ssn }).success;
  const validateDL = () =>
    driversLicenseSchema.safeParse({
      driversLicense: state.personal.driversLicense,
    }).success;
  const validatePhones = () =>
    phonesSchema.safeParse({
      phoneMobile: state.personal.phoneMobile,
      phoneHome: state.personal.phoneHome,
      phoneWork: state.personal.phoneWork,
    }).success;

  // Family
  const validateMaritalStatus = () =>
    maritalStatusSchema.safeParse({
      maritalStatus: state.family.maritalStatus,
      spouseName: state.family.spouseName,
      spousePhone: state.family.spousePhone,
    }).success;
  const validateChildren = () =>
    childrenInfoSchema.safeParse({
      numberOfChildren: state.family.numberOfChildren ?? undefined,
      childrenAges: state.family.childrenAges,
      minorCompanionsNames: state.family.minorCompanionsNames,
    }).success;

  // Incident
  const validateIncidentDate = () =>
    incidentDateSchema.safeParse({ date: state.incident.date || "" }).success;
  const validateIncidentState = () =>
    incidentStateSchema.safeParse({
      state: (state.incident.state as any) || "",
    }).success;
  const validateIncidentLocationPolice = () =>
    incidentLocationPoliceSchema.safeParse({
      location: state.incident.location || "",
      policeDepartment: state.incident.policeDepartment || "",
      policeReportNumber: state.incident.policeReportNumber || "",
    }).success;
  const validateIncidentTypeRolePolicy = () =>
    incidentTypeRolePolicySchema.safeParse({
      accidentType: state.incident.accidentType,
      role: state.incident.role,
      hasOwnPolicy: state.incident.hasOwnPolicy ?? null,
    }).success;
  const validateIncidentEmsHospital = () =>
    incidentEmsHospitalSchema.safeParse({
      emsAtScene: state.incident.emsAtScene ?? null,
      hospitalTransportedTo: state.incident.hospitalTransportedTo || "",
    }).success;
  const validateIncidentVoiceTickets = () =>
    incidentVoiceAndTicketsSchema.safeParse({
      transcript: state.incident.transcript || "",
      otherDriverTicket: state.incident.otherDriverTicket ?? null,
      otherDriverTicketWhyNot: state.incident.otherDriverTicketWhyNot || "",
      clientTicket: state.incident.clientTicket ?? null,
      clientTicketWhy: state.incident.clientTicketWhy || "",
    }).success;

  // Medical
  const validateMedicalInjuryVoice = () =>
    medicalInjuryVoiceSchema.safeParse({
      transcript: state.medical.transcript || "",
    }).success;
  const validateMedicalPreviousVoice = () =>
    medicalPreviousInjuryVoiceSchema.safeParse({
      previousInjuryTranscript: state.medical.previousInjuryTranscript || "",
    }).success;
  const validateMedicalProviders = () =>
    medicalProvidersSchema.safeParse({ ...state.medical.providers }).success;

  // Insurance & Employment
  const validateInsuranceCompanies = () =>
    insuranceCompaniesSchema.safeParse({
      ...state.insuranceEmployment.insuranceCompanies,
    }).success;
  const validateOtherDriverInsurer = () =>
    otherDriverInsuranceSchema.safeParse({
      otherDriverInsuranceCompany:
        state.insuranceEmployment.otherDriverInsuranceCompany,
    }).success;
  const validateHouseholdUM = () =>
    householdAndUmSchema.safeParse({
      householdPolicies: state.insuranceEmployment.householdPolicies ?? null,
      permissionOpenUmClaim:
        state.insuranceEmployment.permissionOpenUmClaim ?? null,
      umInsuranceCompany: state.insuranceEmployment.umInsuranceCompany || "",
    }).success;
  const validateLostIncome = () =>
    employmentLossSchema.safeParse({
      lostIncomeOrMissedWork:
        state.insuranceEmployment.lostIncomeOrMissedWork ?? null,
      employerPhone: state.insuranceEmployment.employerPhone || "",
      employerAddress: state.insuranceEmployment.employerAddress || "",
    }).success;

  // Damages
  const validateDamagesProperty = () =>
    damagesPropertySchema.safeParse({ ...state.damages }).success;
  const validateDamagesBills = () =>
    damagesBillsSchema.safeParse({ ...state.damages }).success;
  const validateDamagesOther = () =>
    damagesOtherCostsSchema.safeParse({ ...state.damages }).success;

  // Witnesses & Attorneys
  const validateWitnesses = () =>
    witnessesSchema.safeParse({
      witnesses: state.witnessesAttorneys.witnesses || "",
    }).success;
  const validateAttorney = () =>
    attorneySchema.safeParse({
      spokeToAnotherAttorney:
        state.witnessesAttorneys.spokeToAnotherAttorney ?? null,
      attorneyNameAddress: state.witnessesAttorneys.attorneyNameAddress || "",
    }).success;

  const docHas = (cat: "license" | "insurance" | "evidence") =>
    state.uploads.some((u) => u.category === cat);
  const agreeOk = (k: "hipaa" | "representation" | "fee") => {
    const a = state.agreements[k];
    return Boolean(a.initials && a.date && a.agreed);
  };

  return [
    // Personal (0-9)
    validateFullName(), // 0
    validateDateOfBirth(), // 1
    validateSSN(), // 2
    validateDL(), // 3
    validateAddressStreet(), // 4
    validateAddressCity(), // 5
    validateAddressState(), // 6
    validateAddressZip(), // 7
    validatePhones(), // 8
    validateEmail(), // 9

    // Family & Status (10-11)
    validateMaritalStatus(), // 10
    validateChildren(), // 11

    // Incident (12-17)
    validateIncidentDate(), // 12
    validateIncidentState(), // 13
    validateIncidentLocationPolice(), // 14
    validateIncidentTypeRolePolicy(), // 15
    validateIncidentEmsHospital(), // 16
    validateIncidentVoiceTickets(), // 17

    // Medical (18-20)
    validateMedicalInjuryVoice(), // 18
    validateMedicalPreviousVoice(), // 19
    validateMedicalProviders(), // 20

    // Insurance & Employment (21-24)
    validateInsuranceCompanies(), // 21
    validateOtherDriverInsurer(), // 22
    validateHouseholdUM(), // 23
    validateLostIncome(), // 24

    // Damages & Costs (25-27)
    validateDamagesProperty(), // 25
    validateDamagesBills(), // 26
    validateDamagesOther(), // 27

    // Witnesses & Attorneys (28-29)
    validateWitnesses(), // 28
    validateAttorney(), // 29

    // Documents (30-32)
    docHas("license"), // 30
    docHas("insurance"), // 31
    docHas("evidence"), // 32

    // Agreements (33-35)
    agreeOk("hipaa"), // 33
    agreeOk("representation"), // 34
    agreeOk("fee"), // 35

    // Review (36)
    Boolean(state.agreed), // 36
  ];
};

export const getCurrentStepValidation = (state: IntakeState, step: number) => {
  const validList = getValidationList(state);
  return validList[Math.min(step, validList.length - 1)];
};

// Constants for questionnaire flow
export const TOTAL_QUESTIONS = 37;
export const SECTION_STARTS = [
  0, // Personal
  10, // Family & Status
  12, // Incident
  18, // Medical
  21, // Insurance & Employment
  25, // Damages & Costs
  28, // Witnesses & Attorneys
  30, // Documents
  33, // Agreements
  36, // Review
];

// Helper functions for step state computation
export const getSectionFromQuestion = (q: number) => {
  if (q >= 36) return 9; // Review
  if (q >= 33) return 8; // Agreements
  if (q >= 30) return 7; // Documents
  if (q >= 28) return 6; // Witnesses & Attorneys
  if (q >= 25) return 5; // Damages & Costs
  if (q >= 21) return 4; // Insurance & Employment
  if (q >= 18) return 3; // Medical
  if (q >= 12) return 2; // Incident
  if (q >= 10) return 1; // Family & Status
  return 0; // Personal
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
    { start: 0, end: 9, sectionIndex: 0 }, // Personal
    { start: 10, end: 11, sectionIndex: 1 }, // Family & Status
    { start: 12, end: 17, sectionIndex: 2 }, // Incident
    { start: 18, end: 20, sectionIndex: 3 }, // Medical
    { start: 21, end: 24, sectionIndex: 4 }, // Insurance & Employment
    { start: 25, end: 27, sectionIndex: 5 }, // Damages & Costs
    { start: 28, end: 29, sectionIndex: 6 }, // Witnesses & Attorneys
    { start: 30, end: 32, sectionIndex: 7 }, // Documents
    { start: 33, end: 35, sectionIndex: 8 }, // Agreements
    { start: 36, end: 36, sectionIndex: 9 }, // Review
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
    { start: 0, end: 9, sectionIndex: 0 },
    { start: 10, end: 11, sectionIndex: 1 },
    { start: 12, end: 17, sectionIndex: 2 },
    { start: 18, end: 20, sectionIndex: 3 },
    { start: 21, end: 24, sectionIndex: 4 },
    { start: 25, end: 27, sectionIndex: 5 },
    { start: 28, end: 29, sectionIndex: 6 },
    { start: 30, end: 32, sectionIndex: 7 },
    { start: 33, end: 35, sectionIndex: 8 },
    { start: 36, end: 36, sectionIndex: 9 },
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
