"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { addressSchema, type AddressFormData } from "../validation";

interface AddressStepProps {
  address: string;
  onChange: (data: AddressFormData) => void;
}

export function AddressStep({ address, onChange }: AddressStepProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address,
    },
    mode: "onChange",
  });

  // Watch for changes and call onChange (only if value changed)
  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.address) {
      if (watchedValues.address !== address) {
        onChange(watchedValues);
      }
    }
  }, [watchedValues, isValid, onChange, address]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Label htmlFor="address">Address</Label>
      <Input
        id="address"
        value={watchedValues.address}
        autoFocus
        {...register("address")}
      />
      {errors.address && (
        <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
      )}
    </motion.div>
  );
}
