"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MedicalVoice } from "./medical-voice";
import { medicalProvidersSchema } from "../validation";
import { DatePicker } from "@/components/ui/date-picker";
import type { z } from "zod";

export function MedicalInjuryVoiceStep({
  transcript,
  onSave,
}: {
  transcript?: string;
  onSave: (t: string) => void;
}) {
  // Validation performed in utils for step completeness; this wrapper keeps consistent UX
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <MedicalVoice transcript={transcript} onSave={onSave} />
    </motion.div>
  );
}

export function MedicalPreviousInjuryVoiceStep({
  previousTranscript,
  onSave,
}: {
  previousTranscript?: string;
  onSave: (t: string) => void;
}) {
  // Simple wrapper using same component
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <MedicalVoice transcript={previousTranscript} onSave={onSave} />
    </motion.div>
  );
}

export function MedicalProvidersStep({
  value,
  onChange,
}: {
  value: {
    emsAmbulance?: string;
    hospital?: string;
    erPhysician?: string;
    chiropractor?: string;
    firstTreatmentDate?: string;
    nextVisitDate?: string;
  };
  onChange: (v: z.infer<typeof medicalProvidersSchema>) => void;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(medicalProvidersSchema),
    defaultValues: value,
    mode: "onChange",
  });
  const emsAmbulance = watch("emsAmbulance");
  const hospital = watch("hospital");
  const erPhysician = watch("erPhysician");
  const chiropractor = watch("chiropractor");
  const firstTreatmentDate = watch("firstTreatmentDate");
  const nextVisitDate = watch("nextVisitDate");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid) {
      onChangeRef.current({
        emsAmbulance,
        hospital,
        erPhysician,
        chiropractor,
        firstTreatmentDate,
        nextVisitDate,
      });
    }
  }, [
    emsAmbulance,
    hospital,
    erPhysician,
    chiropractor,
    firstTreatmentDate,
    nextVisitDate,
    isValid,
  ]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <Label htmlFor="emsAmbulance">EMS/Ambulance (optional)</Label>
        <Input id="emsAmbulance" {...register("emsAmbulance")} />
      </div>
      <div>
        <Label htmlFor="hospital">Hospital (optional)</Label>
        <Input id="hospital" {...register("hospital")} />
      </div>
      <div>
        <Label htmlFor="erPhysician">ER Physician (optional)</Label>
        <Input id="erPhysician" {...register("erPhysician")} />
      </div>
      <div>
        <Label htmlFor="chiropractor">Chiropractor (optional)</Label>
        <Input id="chiropractor" {...register("chiropractor")} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstTreatmentDate">
            First Date of Treatment (optional)
          </Label>
          <DatePicker
            id="firstTreatmentDate"
            value={firstTreatmentDate}
            onChange={(v) => setValue("firstTreatmentDate", v)}
          />
        </div>
        <div>
          <Label htmlFor="nextVisitDate">Next Visit Date (optional)</Label>
          <DatePicker
            id="nextVisitDate"
            value={nextVisitDate}
            onChange={(v) => setValue("nextVisitDate", v)}
          />
        </div>
      </div>
    </motion.div>
  );
}
