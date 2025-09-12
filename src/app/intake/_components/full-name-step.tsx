"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fullNameSchema, type FullNameFormData } from "../validation";
import { splitFullName } from "../utils";

interface FullNameStepProps {
  firstName: string;
  lastName: string;
  onChange: (data: { firstName: string; lastName: string }) => void;
}

export function FullNameStep({
  firstName,
  lastName,
  onChange,
}: FullNameStepProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<FullNameFormData>({
    resolver: zodResolver(fullNameSchema),
    defaultValues: {
      fullName: [firstName, lastName].filter(Boolean).join(" "),
    },
    mode: "onChange",
  });

  // Watch for changes and call onChange with split values (only if changed)
  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.fullName) {
      const split = splitFullName(watchedValues.fullName);
      if (split.firstName !== firstName || split.lastName !== lastName) {
        onChange(split);
      }
    }
  }, [watchedValues, isValid, onChange, firstName, lastName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Label htmlFor="fullName">Full name</Label>
      <Input
        id="fullName"
        placeholder="e.g., Jane Doe"
        autoFocus
        {...register("fullName")}
      />
      {errors.fullName && (
        <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
      )}
    </motion.div>
  );
}
