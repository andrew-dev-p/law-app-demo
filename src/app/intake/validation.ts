import { z } from "zod";

// US phone number validation - supports various formats
// Accepts: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890, etc.
const phoneRegex =
  /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

export const fullNameSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
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
    .refine((date) => {
      const parsed = new Date(date);
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

      return parsed >= minAge && parsed <= maxAge;
    }, "You must be between 18 and 120 years old"),
});

export const addressSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must be less than 200 characters")
    .regex(/^[^<>{}[\]\\]*$/, "Address contains invalid characters"),
});

// Combined schema for all personal info
export const personalInfoSchema = z.object({
  ...fullNameSchema.shape,
  ...emailSchema.shape,
  ...phoneSchema.shape,
  ...dateOfBirthSchema.shape,
  ...addressSchema.shape,
});

export type FullNameFormData = z.infer<typeof fullNameSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;
export type PhoneFormData = z.infer<typeof phoneSchema>;
export type DateOfBirthFormData = z.infer<typeof dateOfBirthSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
