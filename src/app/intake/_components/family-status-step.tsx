"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EnumField } from "@/components/ui/enum-field";
import { maritalStatusSchema } from "../validation";
import { MaritalStatus } from "../model";

interface FamilyStatusStepProps {
  value: {
    maritalStatus: MaritalStatus;
    spouseName?: string;
    spousePhone?: string;
  };
  onChange: (val: FamilyStatusStepProps["value"]) => void;
}

export function FamilyStatusStep({ value, onChange }: FamilyStatusStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FamilyStatusStepProps["value"]>({
    resolver: zodResolver(maritalStatusSchema),
    defaultValues: value,
    mode: "onChange",
  });

  const watched = watch();
  useEffect(() => {
    if (!isValid) return;
    // Avoid emitting unchanged values that would cause parent setState loops
    const equal =
      watched.maritalStatus === value.maritalStatus &&
      (watched.spouseName || "") === (value.spouseName || "") &&
      (watched.spousePhone || "") === (value.spousePhone || "");
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
      <EnumField
        id="maritalStatus"
        label="Marital Status"
        value={watched.maritalStatus}
        onChange={(v) =>
          setValue("maritalStatus", v as MaritalStatus, {
            shouldValidate: true,
          })
        }
        options={Object.values(MaritalStatus).map((v) => ({
          value: v,
          label: v,
        }))}
      />

      <AnimatePresence mode="wait">
        {watched.maritalStatus === MaritalStatus.Married && (
          <motion.div
            key="spouse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="spouseName">
                Spouse/Significant Other’s Name (optional)
              </Label>
              <Input id="spouseName" {...register("spouseName")} />
            </div>
            <div>
              <Label htmlFor="spousePhone">
                Spouse/Significant Other’s Phone (optional)
              </Label>
              <Input id="spousePhone" {...register("spousePhone")} />
              {errors.spousePhone && (
                <p className="text-sm text-red-600 mt-1">
                  {String(errors.spousePhone.message)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
