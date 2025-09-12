"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ssnSchema, type SSNFormData } from "../validation";

interface SSNStepProps {
  ssn: string;
  onChange: (data: SSNFormData) => void;
}

export function SSNStep({ ssn, onChange }: SSNStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SSNFormData>({
    resolver: zodResolver(ssnSchema),
    defaultValues: { ssn },
    mode: "onChange",
  });

  const watched = watch();
  useEffect(() => {
    if (isValid && watched.ssn !== ssn) {
      onChange(watched);
    }
  }, [watched, isValid, onChange, ssn]);

  const formatSSN = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    if (digits.length >= 5) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    if (digits.length >= 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return digits;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <Label htmlFor="ssn">Social Security Number</Label>
      <Input
        id="ssn"
        placeholder="123-45-6789"
        value={watched.ssn}
        autoFocus
        {...register("ssn")}
        onChange={(e) => setValue("ssn", formatSSN(e.target.value), { shouldValidate: true })}
        maxLength={11}
      />
      {errors.ssn && <p className="text-sm text-red-600 mt-1">{errors.ssn.message}</p>}
    </motion.div>
  );
}

