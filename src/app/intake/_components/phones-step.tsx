"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { phonesSchema, type PhonesFormData } from "../validation";

interface PhonesStepProps {
  value: { phoneMobile: string; phoneHome?: string; phoneWork?: string };
  onChange: (data: PhonesFormData) => void;
}

export function PhonesStep({ value, onChange }: PhonesStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Required<PhonesFormData>>({
    resolver: zodResolver(phonesSchema) as Resolver<Required<PhonesFormData>>,
    defaultValues: value as Required<PhonesFormData>,
    mode: "onChange",
  });

  const fmt = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 10);
    if (d.length >= 7)
      return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    if (d.length >= 4) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    if (d.length > 0) return `(${d}`;
    return d;
  };

  const watched = watch();
  useEffect(() => {
    if (!isValid) return;
    const equal =
      (watched.phoneMobile || "") === (value.phoneMobile || "") &&
      (watched.phoneHome || "") === (value.phoneHome || "") &&
      (watched.phoneWork || "") === (value.phoneWork || "");
    if (equal) return;
    onChange(watched);
  }, [watched, value, isValid, onChange]);

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div>
        <Label htmlFor="phoneMobile">Mobile Phone (required)</Label>
        <Input
          id="phoneMobile"
          value={watched.phoneMobile}
          autoFocus
          {...register("phoneMobile")}
          onChange={(e) =>
            setValue("phoneMobile", fmt(e.target.value), {
              shouldValidate: true,
            })
          }
        />
        {errors.phoneMobile && (
          <p className="text-sm text-red-600 mt-1">
            {errors.phoneMobile.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="phoneHome">Home Phone (optional)</Label>
        <Input
          id="phoneHome"
          value={watched.phoneHome || ""}
          {...register("phoneHome")}
          onChange={(e) =>
            setValue("phoneHome", fmt(e.target.value), { shouldValidate: true })
          }
        />
        {errors.phoneHome && (
          <p className="text-sm text-red-600 mt-1">
            {errors.phoneHome.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="phoneWork">Work Phone (optional)</Label>
        <Input
          id="phoneWork"
          value={watched.phoneWork || ""}
          {...register("phoneWork")}
          onChange={(e) =>
            setValue("phoneWork", fmt(e.target.value), { shouldValidate: true })
          }
        />
        {errors.phoneWork && (
          <p className="text-sm text-red-600 mt-1">
            {errors.phoneWork.message as string}
          </p>
        )}
      </div>
    </motion.div>
  );
}
