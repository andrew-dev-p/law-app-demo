"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fullNameSchema, type FullNameFormData } from "../validation";

interface FullNameStepProps {
  firstName: string;
  lastName: string;
  onChange: (data: FullNameFormData) => void;
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
      firstName,
      lastName,
    },
    mode: "onChange",
  });

  // Watch for changes and call onChange
  const watchedValues = watch();
  useEffect(() => {
    if (isValid) {
      onChange(watchedValues);
    }
  }, [watchedValues, isValid, onChange]);

  const fullName = [watchedValues.firstName, watchedValues.lastName]
    .filter(Boolean)
    .join(" ");

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
        value={fullName}
        autoFocus
        {...register("firstName")}
        onChange={(e) => {
          const raw = e.target.value.trim();
          if (!raw) {
            // Clear both fields if input is empty
            return;
          }
          const parts = raw.split(/\s+/);
          const first = parts[0] || "";
          const last = parts.slice(1).join(" ");

          // Update the form values
          const event = {
            target: { value: first },
          } as React.ChangeEvent<HTMLInputElement>;
          register("firstName").onChange(event);

          const lastEvent = {
            target: { value: last },
          } as React.ChangeEvent<HTMLInputElement>;
          register("lastName").onChange(lastEvent);
        }}
      />
      {errors.firstName && (
        <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
      )}
      {errors.lastName && (
        <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
      )}
    </motion.div>
  );
}
