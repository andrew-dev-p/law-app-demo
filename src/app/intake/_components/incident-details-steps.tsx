"use client";

import { useEffect, useRef } from "react";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EnumField } from "@/components/ui/enum-field";
import { BooleanField } from "@/components/ui/boolean-field";
import {
  incidentDateSchema,
  incidentEmsHospitalSchema,
  incidentLocationPoliceSchema,
  incidentStateSchema,
  incidentTypeRolePolicySchema,
  incidentVoiceAndTicketsSchema,
} from "../validation";
import { AccidentType, RoleType, US_STATE_OPTIONS } from "../model";
import { IncidentVoice } from "./incident-voice";
import { DatePicker } from "@/components/ui/date-picker";

export function IncidentDateStep({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: { date: string }) => void;
}) {
  const {
    setValue,
    watch,
    formState: { isValid, errors },
  } = useForm<{ date: string }>({
    resolver: zodResolver(incidentDateSchema),
    defaultValues: { date: value || "" },
    mode: "onChange",
  });
  const date = watch("date");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid) onChangeRef.current({ date });
  }, [date, isValid]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Label htmlFor="date">Date of Accident</Label>
      <DatePicker
        id="date"
        autoFocus
        value={date}
        onChange={(v) => setValue("date", v, { shouldValidate: true })}
      />
      {errors.date && (
        <p className="text-sm text-red-600 mt-1">
          {String(errors.date.message)}
        </p>
      )}
    </motion.div>
  );
}

export function IncidentStateStep({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: { state: string }) => void;
}) {
  const {
    setValue,
    watch,
    formState: { isValid, errors },
  } = useForm<{ state: string }>({
    resolver: zodResolver(incidentStateSchema),
    defaultValues: { state: value || "" },
    mode: "onChange",
  });
  const stateValue = watch("state");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid) onChangeRef.current({ state: stateValue });
  }, [stateValue, isValid]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <EnumField
        id="incidentState"
        label="State of Accident"
        value={stateValue}
        onChange={(v) => setValue("state", v, { shouldValidate: true })}
        options={US_STATE_OPTIONS.map((s) => ({ value: s, label: s }))}
      />
      {errors.state && (
        <p className="text-sm text-red-600 mt-1">
          {String(errors.state.message)}
        </p>
      )}
    </motion.div>
  );
}

export function IncidentLocationPoliceStep({
  value,
  onChange,
}: {
  value: {
    location?: string;
    policeDepartment?: string;
    policeReportNumber?: string;
  };
  onChange: (v: {
    location?: string;
    policeDepartment?: string;
    policeReportNumber?: string;
  }) => void;
}) {
  const {
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<{
    location: string;
    policeDepartment?: string;
    policeReportNumber?: string;
  }>({
    resolver: zodResolver(incidentLocationPoliceSchema),
    defaultValues: {
      location: value.location || "",
      policeDepartment: value.policeDepartment || "",
      policeReportNumber: value.policeReportNumber || "",
    },
    mode: "onChange",
  });
  const location = watch("location");
  const policeDepartment = watch("policeDepartment");
  const policeReportNumber = watch("policeReportNumber");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({
        location,
        policeDepartment,
        policeReportNumber,
      });
  }, [location, policeDepartment, policeReportNumber, isValid]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <Label htmlFor="location">Location of Accident</Label>
        <Input id="location" autoFocus {...register("location")} />
        {errors.location && (
          <p className="text-sm text-red-600 mt-1">
            {String(errors.location.message)}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="policeDepartment">Police Department (optional)</Label>
        <Input id="policeDepartment" {...register("policeDepartment")} />
      </div>
      <div>
        <Label htmlFor="policeReportNumber">Police Report # (optional)</Label>
        <Input id="policeReportNumber" {...register("policeReportNumber")} />
      </div>
    </motion.div>
  );
}

export function IncidentTypeRolePolicyStep({
  value,
  onChange,
}: {
  value: {
    accidentType?: AccidentType;
    role?: RoleType;
    hasOwnPolicy?: boolean | null;
  };
  onChange: (v: {
    accidentType?: AccidentType;
    role?: RoleType;
    hasOwnPolicy?: boolean | null;
  }) => void;
}) {
  const {
    setValue,
    watch,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof incidentTypeRolePolicySchema>>({
    resolver: zodResolver(incidentTypeRolePolicySchema),
    defaultValues: value as Partial<
      z.infer<typeof incidentTypeRolePolicySchema>
    >,
    mode: "onChange",
  });
  const accidentType = watch("accidentType");
  const role = watch("role");
  const hasOwnPolicy = watch("hasOwnPolicy");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid) onChangeRef.current({ accidentType, role, hasOwnPolicy });
  }, [accidentType, role, hasOwnPolicy, isValid]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <EnumField
        id="accidentType"
        label="Type of Accident"
        value={accidentType}
        onChange={(v) =>
          setValue("accidentType", v as AccidentType, { shouldValidate: true })
        }
        options={Object.values(AccidentType).map((v) => ({
          value: v,
          label: v,
        }))}
      />
      {errors.accidentType && (
        <p className="text-sm text-red-600 mt-1">
          {String(errors.accidentType.message)}
        </p>
      )}
      <EnumField
        id="role"
        label="You were"
        value={role}
        onChange={(v) =>
          setValue("role", v as RoleType, { shouldValidate: true })
        }
        options={Object.values(RoleType).map((v) => ({ value: v, label: v }))}
      />
      {errors.role && (
        <p className="text-sm text-red-600 mt-1">
          {String(errors.role.message)}
        </p>
      )}
      <AnimatePresence>
        {role === RoleType.Passenger && (
          <motion.div
            key="own-policy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <BooleanField
              id="hasOwnPolicy"
              label="Do you have your own policy? (optional)"
              value={hasOwnPolicy ?? null}
              onChange={(v) =>
                setValue("hasOwnPolicy", v, { shouldValidate: true })
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function IncidentEmsHospitalStep({
  value,
  onChange,
}: {
  value: { emsAtScene?: boolean | null; hospitalTransportedTo?: string };
  onChange: (v: {
    emsAtScene?: boolean | null;
    hospitalTransportedTo?: string;
  }) => void;
}) {
  const {
    setValue,
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<{ emsAtScene: boolean | null; hospitalTransportedTo?: string }>({
    resolver: zodResolver(incidentEmsHospitalSchema),
    defaultValues: {
      emsAtScene: value.emsAtScene ?? null,
      hospitalTransportedTo: value.hospitalTransportedTo || "",
    },
    mode: "onChange",
  });
  const emsAtScene = watch("emsAtScene");
  const hospitalTransportedTo = watch("hospitalTransportedTo");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid) onChangeRef.current({ emsAtScene, hospitalTransportedTo });
  }, [emsAtScene, hospitalTransportedTo, isValid]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BooleanField
        id="emsAtScene"
        label="EMS at Scene?"
        value={emsAtScene}
        onChange={(v) => setValue("emsAtScene", v, { shouldValidate: true })}
        allowUndefined={false}
      />
      {errors.emsAtScene && (
        <p className="text-sm text-red-600 mt-1">
          {String(errors.emsAtScene.message)}
        </p>
      )}
      <AnimatePresence>
        {emsAtScene === true && (
          <motion.div
            key="hospital"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Label htmlFor="hospitalTransportedTo">
              Hospital Transported To
            </Label>
            <Input
              id="hospitalTransportedTo"
              {...register("hospitalTransportedTo")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function IncidentVoiceTicketsStep({
  value,
  onChange,
  transcript,
  onSave,
}: {
  value: {
    otherDriverTicket?: boolean | null;
    otherDriverTicketWhyNot?: string;
    clientTicket?: boolean | null;
    clientTicketWhy?: string;
  };
  onChange: (v: Partial<typeof value>) => void;
  transcript?: string;
  onSave: (t: string) => void;
}) {
  const {
    setValue,
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<{
    transcript: string;
    otherDriverTicket?: boolean | null;
    otherDriverTicketWhyNot?: string;
    clientTicket?: boolean | null;
    clientTicketWhy?: string;
  }>({
    resolver: zodResolver(incidentVoiceAndTicketsSchema),
    defaultValues: {
      transcript: transcript || "",
      otherDriverTicket: value.otherDriverTicket ?? null,
      otherDriverTicketWhyNot: value.otherDriverTicketWhyNot || "",
      clientTicket: value.clientTicket ?? null,
      clientTicketWhy: value.clientTicketWhy || "",
    },
    mode: "onChange",
  });
  const otherDriverTicket = watch("otherDriverTicket");
  const otherDriverTicketWhyNot = watch("otherDriverTicketWhyNot");
  const clientTicket = watch("clientTicket");
  const clientTicketWhy = watch("clientTicketWhy");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({
        otherDriverTicket,
        otherDriverTicketWhyNot,
        clientTicket,
        clientTicketWhy,
      });
  }, [
    otherDriverTicket,
    otherDriverTicketWhyNot,
    clientTicket,
    clientTicketWhy,
    isValid,
  ]);
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <IncidentVoice
        transcript={transcript}
        onSave={(t) => {
          setValue("transcript", t, { shouldValidate: true });
          onSave(t);
        }}
      />
      {errors.transcript && (
        <p className="text-sm text-red-600 mt-1">
          {String(errors.transcript.message)}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <BooleanField
            id="otherDriverTicket"
            label="Did other driver receive ticket? (optional)"
            value={otherDriverTicket ?? null}
            onChange={(v) =>
              setValue("otherDriverTicket", v, { shouldValidate: true })
            }
          />
          <AnimatePresence>
            {otherDriverTicket === false && (
              <motion.div
                key="why-not"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <Label htmlFor="otherDriverTicketWhyNot">Why not?</Label>
                <Input
                  id="otherDriverTicketWhyNot"
                  {...register("otherDriverTicketWhyNot")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="space-y-2">
          <BooleanField
            id="clientTicket"
            label="Did client receive ticket? (optional)"
            value={clientTicket ?? null}
            onChange={(v) =>
              setValue("clientTicket", v, { shouldValidate: true })
            }
          />
          <AnimatePresence>
            {clientTicket === true && (
              <motion.div
                key="client-why"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <Label htmlFor="clientTicketWhy">Why?</Label>
                <Input id="clientTicketWhy" {...register("clientTicketWhy")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
