export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
};

export type IncidentInfo = {
  date: string;
  location: string;
  type: "Auto" | "Slip and Fall" | "Workplace" | "Other" | "";
  description: string;
  policeReport: "yes" | "no" | "";
  claimNumber: string;
  transcript?: string;
};

export type MedicalInfo = {
  injuries: string[];
  seenDoctor: "yes" | "no" | "";
  needReferral: boolean;
  preferredProvider: string;
  city: string;
};

export type UploadItem = { id: string; name: string; size: number };

export type Agreement = {
  initials: string;
  date: string; // YYYY-MM-DD
  agreed: boolean;
};

export type IntakeState = {
  personal: PersonalInfo;
  incident: IncidentInfo;
  medical: MedicalInfo;
  uploads: UploadItem[];
  agreed: boolean;
  agreements: {
    hipaa: Agreement;
    representation: Agreement;
    fee: Agreement;
  };
};

export const defaultState: IntakeState = {
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
  agreements: {
    hipaa: { initials: "", date: "", agreed: false },
    representation: { initials: "", date: "", agreed: false },
    fee: { initials: "", date: "", agreed: false },
  },
};

export const steps = [
  { key: "personal", title: "Personal Info" },
  { key: "incident", title: "Incident Details" },
  { key: "medical", title: "Medical & Referral" },
  { key: "uploads", title: "Documents" },
  { key: "agreements", title: "Agreements" },
  { key: "review", title: "Review & Submit" },
] as const;

export type Step = typeof steps[number];
