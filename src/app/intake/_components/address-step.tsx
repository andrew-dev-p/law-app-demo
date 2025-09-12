"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  addressStreetSchema,
  addressCitySchema,
  addressStateSchema,
  addressZipSchema,
  type AddressStreetFormData,
  type AddressCityFormData,
  type AddressStateFormData,
  type AddressZipFormData,
} from "../validation";

interface StreetStepProps {
  value: string;
  onChange: (data: AddressStreetFormData) => void;
}

export function StreetStep({ value, onChange }: StreetStepProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<AddressStreetFormData>({
    resolver: zodResolver(addressStreetSchema),
    defaultValues: {
      addressStreet: value,
    },
    mode: "onChange",
  });

  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.addressStreet !== value) {
      onChange(watchedValues);
    }
  }, [watchedValues, isValid, onChange, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Label htmlFor="addressStreet">Street</Label>
      <Input id="addressStreet" autoFocus {...register("addressStreet")} />
      {errors.addressStreet && (
        <p className="text-sm text-red-600 mt-1">
          {errors.addressStreet.message}
        </p>
      )}
    </motion.div>
  );
}

interface CityStepProps {
  value: string;
  onChange: (data: AddressCityFormData) => void;
}

export function CityStep({ value, onChange }: CityStepProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<AddressCityFormData>({
    resolver: zodResolver(addressCitySchema),
    defaultValues: {
      addressCity: value,
    },
    mode: "onChange",
  });

  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.addressCity !== value) {
      onChange(watchedValues);
    }
  }, [watchedValues, isValid, onChange, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Label htmlFor="addressCity">City</Label>
      <Input id="addressCity" autoFocus {...register("addressCity")} />
      {errors.addressCity && (
        <p className="text-sm text-red-600 mt-1">
          {errors.addressCity.message}
        </p>
      )}
    </motion.div>
  );
}

interface StateStepProps {
  value: string;
  onChange: (data: AddressStateFormData) => void;
}

export function StateStep({ value, onChange }: StateStepProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<AddressStateFormData>({
    resolver: zodResolver(addressStateSchema),
    defaultValues: {
      addressState: value,
    },
    mode: "onChange",
  });

  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.addressState !== value) {
      onChange(watchedValues);
    }
  }, [watchedValues, isValid, onChange, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Label htmlFor="addressState">State</Label>
      <Input id="addressState" autoFocus {...register("addressState")} />
      {errors.addressState && (
        <p className="text-sm text-red-600 mt-1">
          {errors.addressState.message}
        </p>
      )}
    </motion.div>
  );
}

interface ZipStepProps {
  value: string;
  onChange: (data: AddressZipFormData) => void;
}

export function ZipStep({ value, onChange }: ZipStepProps) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<AddressZipFormData>({
    resolver: zodResolver(addressZipSchema),
    defaultValues: {
      addressZip: value,
    },
    mode: "onChange",
  });

  const watchedValues = watch();
  useEffect(() => {
    if (isValid && watchedValues.addressZip !== value) {
      onChange(watchedValues);
    }
  }, [watchedValues, isValid, onChange, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Label htmlFor="addressZip">ZIP code</Label>
      <Input id="addressZip" autoFocus {...register("addressZip")} />
      {errors.addressZip && (
        <p className="text-sm text-red-600 mt-1">{errors.addressZip.message}</p>
      )}
    </motion.div>
  );
}
