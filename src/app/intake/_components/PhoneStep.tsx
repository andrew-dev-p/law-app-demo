"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { phoneSchema, type PhoneFormData } from "../validation";

interface PhoneStepProps {
  phone: string;
  onChange: (data: PhoneFormData) => void;
}

export function PhoneStep({ phone, onChange }: PhoneStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone,
    },
    mode: "onChange",
  });

  // Watch for changes and call onChange
  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.phone) {
      onChange(watchedValues);
    }
  }, [watchedValues, isValid, onChange]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limitedDigits.length >= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(
        3,
        6
      )}-${limitedDigits.slice(6)}`;
    } else if (limitedDigits.length >= 3) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else if (limitedDigits.length > 0) {
      return `(${limitedDigits}`;
    }
    return limitedDigits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setValue("phone", formatted, { shouldValidate: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Label htmlFor="phone">Phone</Label>
      <Input
        id="phone"
        placeholder="(555) 555-5555"
        value={watchedValues.phone}
        autoFocus
        {...register("phone")}
        onChange={handlePhoneChange}
        maxLength={14} // (XXX) XXX-XXXX = 14 characters
      />
      {errors.phone && (
        <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
      )}
    </motion.div>
  );
}
