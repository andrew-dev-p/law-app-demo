export enum MaritalStatus {
  Married = "Married",
  Single = "Single",
  Divorced = "Divorced",
  Other = "Other",
}

export const US_STATE_OPTIONS = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];
export type USStateCode = (typeof US_STATE_OPTIONS)[number];

export enum AccidentType {
  MotorVehicle = "Motor Vehicle",
  SlipFall = "Slip & Fall",
  Other = "Other",
}

export enum RoleType {
  Driver = "Driver",
  Passenger = "Passenger",
  Pedestrian = "Pedestrian",
  Other = "Other",
}

export type PersonalInfo = {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  ssn: string;
  driversLicense: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  phoneMobile: string;
  phoneHome?: string;
  phoneWork?: string;
  email: string;
};

export type IncidentInfo = {
  date?: string; // YYYY-MM-DD
  state?: USStateCode;
  location?: string;
  policeDepartment?: string;
  policeReportNumber?: string;
  accidentType?: AccidentType;
  role?: RoleType;
  hasOwnPolicy?: boolean | null; // only if Passenger
  emsAtScene?: boolean | null; // required in validation
  hospitalTransportedTo?: string; // if emsAtScene === true
  transcript?: string; // incident description voice (required)
  otherDriverTicket?: boolean | null;
  otherDriverTicketWhyNot?: string; // if otherDriverTicket === false
  clientTicket?: boolean | null;
  clientTicketWhy?: string; // if clientTicket === true
};

export type MedicalInfo = {
  transcript?: string; // Injury description voice (required)
  previousInjuryTranscript?: string; // Previous injury history voice (required)
  providers: {
    emsAmbulance?: string;
    hospital?: string;
    erPhysician?: string;
    chiropractor?: string;
    firstTreatmentDate?: string; // YYYY-MM-DD
    nextVisitDate?: string; // YYYY-MM-DD
  };
};

export type FamilyStatusInfo = {
  maritalStatus: MaritalStatus;
  spouseName?: string;
  spousePhone?: string;
  numberOfChildren?: number | null;
  childrenAges?: string;
  minorCompanionsNames?: string;
};

export type InsuranceEmploymentInfo = {
  insuranceCompanies: {
    autoOrHealth?: string;
    medPayOrPip?: string;
    workersComp?: string;
  };
  otherDriverInsuranceCompany: string;
  householdPolicies?: boolean | null;
  permissionOpenUmClaim: boolean | null;
  umInsuranceCompany?: string; // required if permissionOpenUmClaim true
  lostIncomeOrMissedWork: boolean | null;
  employerPhone?: string; // required if lostIncomeOrMissedWork true
  employerAddress?: string; // required if lostIncomeOrMissedWork true
};

export type DamagesCostsInfo = {
  propertyDamage?: number | null;
  repair?: number | null;
  depreciation?: number | null;
  totaled?: number | null;
  bills?: number | null;
  xrayBill?: number | null;
  ambulanceBill?: number | null;
  hospitalBill?: number | null;
  otherMedicalCosts?: number | null;
  mdBills?: number | null;
  otherBills?: number | null;
  prescriptionCosts?: number | null;
};

export type WitnessesAttorneysInfo = {
  witnesses?: string;
  spokeToAnotherAttorney: boolean | null;
  attorneyNameAddress?: string; // required if spokeToAnotherAttorney true
};

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  mime?: string;
  url?: string; // object URL for preview
  category?: "license" | "insurance" | "evidence";
};

export type Agreement = {
  initials: string;
  date: string; // YYYY-MM-DD
  agreed: boolean;
};

export type IntakeState = {
  personal: PersonalInfo;
  family: FamilyStatusInfo;
  incident: IncidentInfo;
  medical: MedicalInfo;
  insuranceEmployment: InsuranceEmploymentInfo;
  damages: DamagesCostsInfo;
  witnessesAttorneys: WitnessesAttorneysInfo;
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
    dob: "",
    ssn: "",
    driversLicense: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
    phoneMobile: "",
    phoneHome: "",
    phoneWork: "",
    email: "",
  },
  family: {
    maritalStatus: MaritalStatus.Single,
    spouseName: "",
    spousePhone: "",
    numberOfChildren: null,
    childrenAges: "",
    minorCompanionsNames: "",
  },
  incident: {
    date: "",
    state: undefined,
    location: "",
    policeDepartment: "",
    policeReportNumber: "",
    accidentType: undefined,
    role: undefined,
    hasOwnPolicy: null,
    emsAtScene: null,
    hospitalTransportedTo: "",
    transcript: "",
    otherDriverTicket: null,
    otherDriverTicketWhyNot: "",
    clientTicket: null,
    clientTicketWhy: "",
  },
  medical: {
    transcript: "",
    previousInjuryTranscript: "",
    providers: {
      emsAmbulance: "",
      hospital: "",
      erPhysician: "",
      chiropractor: "",
      firstTreatmentDate: "",
      nextVisitDate: "",
    },
  },
  insuranceEmployment: {
    insuranceCompanies: { autoOrHealth: "", medPayOrPip: "", workersComp: "" },
    otherDriverInsuranceCompany: "",
    householdPolicies: null,
    permissionOpenUmClaim: null,
    umInsuranceCompany: "",
    lostIncomeOrMissedWork: null,
    employerPhone: "",
    employerAddress: "",
  },
  damages: {
    propertyDamage: null,
    repair: null,
    depreciation: null,
    totaled: null,
    bills: null,
    xrayBill: null,
    ambulanceBill: null,
    hospitalBill: null,
    otherMedicalCosts: null,
    mdBills: null,
    otherBills: null,
    prescriptionCosts: null,
  },
  witnessesAttorneys: {
    witnesses: "",
    spokeToAnotherAttorney: null,
    attorneyNameAddress: "",
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
  { key: "family", title: "Family & Status" },
  { key: "incident", title: "Incident Details" },
  { key: "medical", title: "Medical Details" },
  { key: "insurance", title: "Insurance & Employment" },
  { key: "damages", title: "Damages & Costs" },
  { key: "witnesses", title: "Witnesses & Attorneys" },
  { key: "uploads", title: "Documents" },
  { key: "agreements", title: "Agreements" },
  { key: "review", title: "Review & Submit" },
] as const;

export type Step = (typeof steps)[number];
