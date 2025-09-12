"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { emailSchema, type EmailFormData } from "../validation";

interface EmailStepProps {
  email: string;
  onChange: (data: EmailFormData) => void;
}

export function EmailStep({ email, onChange }: EmailStepProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email,
    },
    mode: "onChange",
  });

  // Watch for changes and call onChange (only if value changed)
  const watchedValues = watch();
  useEffect(() => {
    if (isValid) {
      if (watchedValues.email !== email) {
        onChange(watchedValues);
      }
    }
  }, [watchedValues, isValid, onChange, email]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={watchedValues.email}
        autoFocus
        {...register("email")}
      />
      {errors.email && (
        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
      )}
    </motion.div>
  );
}
