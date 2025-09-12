"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { dateOfBirthSchema, type DateOfBirthFormData } from "../validation";

interface DateOfBirthStepProps {
  dob: string;
  onChange: (data: DateOfBirthFormData) => void;
}

export function DateOfBirthStep({ dob, onChange }: DateOfBirthStepProps) {
  const {
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<DateOfBirthFormData>({
    resolver: zodResolver(dateOfBirthSchema),
    defaultValues: {
      dob,
    },
    mode: "onChange",
  });

  // Watch for changes and call onChange (only if value changed)
  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.dob) {
      if (watchedValues.dob !== dob) {
        onChange(watchedValues);
      }
    }
  }, [watchedValues, isValid, onChange, dob]);

  const handleDateChange = (value: string) => {
    setValue("dob", value, { shouldValidate: true });
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
      <Label htmlFor="dob">Date of birth</Label>
      <DatePicker
        id="dob"
        value={watchedValues.dob}
        onChange={handleDateChange}
      />
      {errors.dob && (
        <p className="text-sm text-red-600 mt-1">{errors.dob.message}</p>
      )}
    </motion.div>
  );
}
