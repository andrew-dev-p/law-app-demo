import { z } from "zod";
import {
  AccidentType,
  MaritalStatus,
  RoleType,
  US_STATE_OPTIONS,
} from "./model";

// US phone number validation - supports various formats
// Accepts: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890, etc.
const phoneRegex =
  /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

export const fullNameSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine((name) => {
      const words = name.trim().split(/\s+/);
      return words.length === 2;
    }, "Please enter exactly first name and last name (2 words only)"),
});

export const emailSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number is too long")
    .regex(phoneRegex, "Please enter a valid US phone number")
    .transform((val) => {
      // Normalize to digits only for storage
      return val.replace(/\D/g, "");
    }),
});

export const dateOfBirthSchema = z.object({
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .superRefine((date, ctx) => {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Please enter a valid date",
        });
        return;
      }

      const now = new Date();
      const minAge = new Date(
        now.getFullYear() - 120,
        now.getMonth(),
        now.getDate()
      );
      const maxAge = new Date(
        now.getFullYear() - 18,
        now.getMonth(),
        now.getDate()
      );

      if (parsed < minAge) {
        ctx.addIssue({
          code: "custom",
          message: "You must be at most 120 years old",
        });
      } else if (parsed > maxAge) {
        ctx.addIssue({
          code: "custom",
          message: "You must be at least 18 years old",
        });
      }
    }),
});

// Address split into 4 fields: street, city, state, zip
export const addressStreetSchema = z.object({
  addressStreet: z
    .string()
    .min(1, "Street address is required")
    .max(200, "Street address must be less than 200 characters")
    .regex(/^[^<>{}[\]\\]*$/, "Street contains invalid characters"),
});

export const addressCitySchema = z.object({
  addressCity: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "City contains invalid characters"),
});

export const addressStateSchema = z.object({
  addressState: z
    .string()
    .min(2, "State is required")
    .max(100, "State must be less than 100 characters"),
});

export const addressZipSchema = z.object({
  addressZip: z
    .string()
    .min(1, "ZIP code is required")
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code"),
});

// Additional personal schemas
export const ssnSchema = z.object({
  ssn: z
    .string()
    .min(1, "SSN is required")
    .regex(/^(\d{3}-?\d{2}-?\d{4})$/, "Enter a valid SSN"),
});

export const driversLicenseSchema = z.object({
  driversLicense: z
    .string()
    .min(1, "Driver's License # is required")
    .max(32, "Driver's License # is too long")
    .regex(/^[A-Za-z0-9\-\s]+$/, "Only letters, numbers and dashes allowed"),
});

export const phonesSchema = z.object({
  phoneMobile: z
    .string()
    .min(1, "Mobile phone is required")
    .regex(phoneRegex, "Enter a valid mobile phone")
    .transform((v) => v.replace(/\D/g, "")),
  phoneHome: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : v))
    .refine((v) => !v || phoneRegex.test(v), {
      message: "Enter a valid home phone",
    }),
  phoneWork: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : v))
    .refine((v) => !v || phoneRegex.test(v), {
      message: "Enter a valid work phone",
    }),
});

// Combined schema for all personal info
export const personalInfoSchema = z.object({
  ...fullNameSchema.shape,
  ...emailSchema.shape,
  // phones handled separately via phonesSchema
  ...dateOfBirthSchema.shape,
  ...addressStreetSchema.shape,
  ...addressCitySchema.shape,
  ...addressStateSchema.shape,
  ...addressZipSchema.shape,
  ...ssnSchema.shape,
  ...driversLicenseSchema.shape,
});

export type FullNameFormData = z.infer<typeof fullNameSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;
export type PhoneFormData = z.infer<typeof phoneSchema>;
export type DateOfBirthFormData = z.infer<typeof dateOfBirthSchema>;
export type AddressStreetFormData = z.infer<typeof addressStreetSchema>;
export type AddressCityFormData = z.infer<typeof addressCitySchema>;
export type AddressStateFormData = z.infer<typeof addressStateSchema>;
export type AddressZipFormData = z.infer<typeof addressZipSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type SSNFormData = z.infer<typeof ssnSchema>;
export type DriversLicenseFormData = z.infer<typeof driversLicenseSchema>;
export type PhonesFormData = z.infer<typeof phonesSchema>;
export type InsuranceCompaniesFormData = z.infer<
  typeof insuranceCompaniesSchema
>;
export type HouseholdAndUmFormData = z.infer<typeof householdAndUmSchema>;
export type EmploymentLossFormData = z.infer<typeof employmentLossSchema>;

// Family & Status
export const maritalStatusSchema = z
  .object({
    maritalStatus: z.nativeEnum(MaritalStatus),
    spouseName: z.string().optional(),
    spousePhone: z
      .string()
      .optional()
      .refine((v) => !v || phoneRegex.test(v), {
        message: "Enter a valid spouse phone",
      }),
  })
  .superRefine((val, ctx) => {
    if (val.maritalStatus === MaritalStatus.Married) {
      // spouse fields are optional overall, no strict requirement
      if (val.spousePhone && !phoneRegex.test(val.spousePhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid spouse phone",
        });
      }
    }
  });

export const childrenInfoSchema = z.object({
  numberOfChildren: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine(
      (v) =>
        v === undefined ||
        (typeof v === "number" ? v >= 0 : /^\d+$/.test(String(v))),
      { message: "Enter a valid non-negative number" }
    ),
  childrenAges: z.string().optional(),
  minorCompanionsNames: z.string().optional(),
});

// Incident details
export const incidentDateSchema = z.object({
  date: z.string().min(1, "Date is required"),
});

export const incidentStateSchema = z.object({
  state: z.enum(US_STATE_OPTIONS as [string, ...string[]], {
    message: "State is required",
  }),
});

export const incidentLocationPoliceSchema = z.object({
  location: z.string().min(1, "Location is required"),
  policeDepartment: z.string().optional(),
  policeReportNumber: z.string().optional(),
});

export const incidentTypeRolePolicySchema = z.object({
  accidentType: z.nativeEnum(AccidentType),
  role: z.nativeEnum(RoleType),
  hasOwnPolicy: z.boolean().nullable().optional(),
});

export const incidentEmsHospitalSchema = z
  .object({
    emsAtScene: z.boolean({ message: "Please select Yes or No" }).nullable(),
    hospitalTransportedTo: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.emsAtScene === null || v.emsAtScene === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select Yes or No",
      });
      return;
    }
    if (v.emsAtScene === true && !v.hospitalTransportedTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hospital transported to is required",
      });
    }
  });

export const incidentVoiceAndTicketsSchema = z
  .object({
    transcript: z.string().min(1, "Incident description is required"),
    otherDriverTicket: z.boolean().nullable().optional(),
    otherDriverTicketWhyNot: z.string().optional(),
    clientTicket: z.boolean().nullable().optional(),
    clientTicketWhy: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.otherDriverTicket === false && !v.otherDriverTicketWhyNot) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please tell us why not",
      });
    }
    if (v.clientTicket === true && !v.clientTicketWhy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please tell us why",
      });
    }
  });

// Medical details
export const medicalInjuryVoiceSchema = z.object({
  transcript: z.string().min(1, "Injury description is required"),
});
export const medicalPreviousInjuryVoiceSchema = z.object({
  previousInjuryTranscript: z
    .string()
    .min(1, "Previous injury history is required"),
});

export const medicalProvidersSchema = z
  .object({
    emsAmbulance: z.string().optional(),
    hospital: z.string().optional(),
    erPhysician: z.string().optional(),
    chiropractor: z.string().optional(),
    firstTreatmentDate: z.string().optional(),
    nextVisitDate: z.string().optional(),
  })
  .refine(
    (v) =>
      Boolean(
        v.emsAmbulance ||
          v.hospital ||
          v.erPhysician ||
          v.chiropractor ||
          v.firstTreatmentDate ||
          v.nextVisitDate
      ),
    { message: "Please provide at least one provider detail" }
  );

// Insurance & Employment
export const insuranceCompaniesSchema = z
  .object({
    autoOrHealth: z.string().optional(),
    medPayOrPip: z.string().optional(),
    workersComp: z.string().optional(),
  })
  .refine((v) => Boolean(v.autoOrHealth || v.medPayOrPip || v.workersComp), {
    message: "Please provide at least one company",
  });

export const otherDriverInsuranceSchema = z.object({
  otherDriverInsuranceCompany: z
    .string()
    .min(1, "Insurance company is required"),
});

export const householdAndUmSchema = z
  .object({
    householdPolicies: z.boolean().nullable().optional(),
    permissionOpenUmClaim: z
      .boolean({ message: "Select Yes or No" })
      .nullable(),
    umInsuranceCompany: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (
      v.permissionOpenUmClaim === null ||
      v.permissionOpenUmClaim === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select Yes or No",
      });
    }
    if (v.permissionOpenUmClaim === true && !v.umInsuranceCompany) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "UM Insurance Company is required",
      });
    }
  });

export const employmentLossSchema = z
  .object({
    lostIncomeOrMissedWork: z
      .boolean({ message: "Select Yes or No" })
      .nullable(),
    employerPhone: z.string().optional(),
    employerAddress: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (
      v.lostIncomeOrMissedWork === null ||
      v.lostIncomeOrMissedWork === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select Yes or No",
      });
    }
    if (v.lostIncomeOrMissedWork === true) {
      if (!v.employerPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employer phone is required",
        });
      } else if (!phoneRegex.test(v.employerPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid employer phone",
        });
      }
      if (!v.employerAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employer address is required",
        });
      }
    }
  });

// Damages & Costs — helper for optional number strings
const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (typeof v === "string") {
      const t = v.trim();
      if (t === "") return undefined;
      const num = Number(t);
      if (Number.isNaN(num)) return NaN;
      return num;
    }
    return v;
  })
  .refine(
    (v) => v === undefined || (typeof v === "number" && Number.isFinite(v)),
    {
      message: "Enter a valid number",
    }
  );

export const damagesPropertySchema = z.object({
  propertyDamage: optionalNumber,
  repair: optionalNumber,
  depreciation: optionalNumber,
  totaled: optionalNumber,
});

export const damagesBillsSchema = z.object({
  bills: optionalNumber,
  xrayBill: optionalNumber,
  ambulanceBill: optionalNumber,
  hospitalBill: optionalNumber,
});

export const damagesOtherCostsSchema = z.object({
  otherMedicalCosts: optionalNumber,
  mdBills: optionalNumber,
  otherBills: optionalNumber,
  prescriptionCosts: optionalNumber,
});

// Witnesses & Attorneys
export const witnessesSchema = z.object({
  witnesses: z.string().optional(),
});

export const attorneySchema = z
  .object({
    spokeToAnotherAttorney: z
      .boolean({ message: "Select Yes or No" })
      .nullable(),
    attorneyNameAddress: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (
      v.spokeToAnotherAttorney === null ||
      v.spokeToAnotherAttorney === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select Yes or No",
      });
    }
    if (v.spokeToAnotherAttorney === true && !v.attorneyNameAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Attorney name & address are required",
      });
    }
  });
