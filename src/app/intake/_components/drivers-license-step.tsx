"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { driversLicenseSchema, type DriversLicenseFormData } from "../validation";

interface DriversLicenseStepProps {
  driversLicense: string;
  onChange: (data: DriversLicenseFormData) => void;
}

export function DriversLicenseStep({ driversLicense, onChange }: DriversLicenseStepProps) {
  const { register, watch, formState: { errors, isValid } } = useForm<DriversLicenseFormData>({
    resolver: zodResolver(driversLicenseSchema),
    defaultValues: { driversLicense },
    mode: "onChange",
  });

  const watched = watch();
  useEffect(() => {
    if (isValid && watched.driversLicense !== driversLicense) {
      onChange(watched);
    }
  }, [watched, isValid, onChange, driversLicense]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <Label htmlFor="driversLicense">Driver’s License #</Label>
      <Input id="driversLicense" autoFocus {...register("driversLicense")} />
      {errors.driversLicense && (
        <p className="text-sm text-red-600 mt-1">{errors.driversLicense.message}</p>
      )}
    </motion.div>
  );
}

