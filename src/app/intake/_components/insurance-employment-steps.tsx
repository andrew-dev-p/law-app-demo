"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BooleanField } from "@/components/ui/boolean-field";
import {
  insuranceCompaniesSchema,
  otherDriverInsuranceSchema,
  householdAndUmSchema,
  employmentLossSchema,
  type InsuranceCompaniesFormData,
  type HouseholdAndUmFormData,
  type EmploymentLossFormData,
} from "../validation";

export function InsuranceCompaniesStep({
  value,
  onChange,
}: {
  value: { autoOrHealth?: string; medPayOrPip?: string; workersComp?: string };
  onChange: (v: InsuranceCompaniesFormData) => void;
}) {
  const {
    register,
    watch,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(insuranceCompaniesSchema),
    defaultValues: value,
    mode: "onChange",
  });
  const autoOrHealth = watch("autoOrHealth");
  const medPayOrPip = watch("medPayOrPip");
  const workersComp = watch("workersComp");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({ autoOrHealth, medPayOrPip, workersComp });
  }, [autoOrHealth, medPayOrPip, workersComp, isValid]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <Label htmlFor="autoOrHealth">Auto/Health Insurance (optional)</Label>
        <Input id="autoOrHealth" {...register("autoOrHealth")} />
      </div>
      <div>
        <Label htmlFor="medPayOrPip">Med Pay/PIP (optional)</Label>
        <Input id="medPayOrPip" {...register("medPayOrPip")} />
      </div>
      <div>
        <Label htmlFor="workersComp">Worker’s Compensation (optional)</Label>
        <Input id="workersComp" {...register("workersComp")} />
      </div>
    </motion.div>
  );
}

export function OtherDriverInsurerStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: { otherDriverInsuranceCompany: string }) => void;
}) {
  const {
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<{ otherDriverInsuranceCompany: string }>({
    resolver: zodResolver(otherDriverInsuranceSchema),
    defaultValues: { otherDriverInsuranceCompany: value || "" },
    mode: "onChange",
  });
  const otherDriverInsuranceCompany = watch("otherDriverInsuranceCompany");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid) onChangeRef.current({ otherDriverInsuranceCompany });
  }, [otherDriverInsuranceCompany, isValid]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Label htmlFor="otherDriverInsuranceCompany">
        AF (Other Driver) Insurance Company
      </Label>
      <Input
        id="otherDriverInsuranceCompany"
        autoFocus
        {...register("otherDriverInsuranceCompany")}
      />
      {errors.otherDriverInsuranceCompany && (
        <p className="text-sm text-red-600 mt-1">
          {errors.otherDriverInsuranceCompany.message}
        </p>
      )}
    </motion.div>
  );
}

export function HouseholdAndUMStep({
  value,
  onChange,
}: {
  value: {
    householdPolicies?: boolean | null;
    permissionOpenUmClaim: boolean | null;
    umInsuranceCompany?: string;
  };
  onChange: (v: HouseholdAndUmFormData) => void;
}) {
  const {
    setValue,
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<{
    householdPolicies?: boolean | null;
    permissionOpenUmClaim: boolean | null;
    umInsuranceCompany?: string;
  }>({
    resolver: zodResolver(householdAndUmSchema),
    defaultValues: value,
    mode: "onChange",
  });
  const householdPolicies = watch("householdPolicies");
  const permissionOpenUmClaim = watch("permissionOpenUmClaim");
  const umInsuranceCompany = watch("umInsuranceCompany");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({
        householdPolicies,
        permissionOpenUmClaim,
        umInsuranceCompany,
      });
  }, [householdPolicies, permissionOpenUmClaim, umInsuranceCompany, isValid]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BooleanField
        id="householdPolicies"
        label="Household Policies (Res Rel?) (optional)"
        value={householdPolicies ?? null}
        onChange={(v) =>
          setValue("householdPolicies", v, { shouldValidate: true })
        }
      />
      <BooleanField
        id="permissionOpenUmClaim"
        label="Permission to open UM Claim?"
        value={permissionOpenUmClaim}
        onChange={(v) =>
          setValue("permissionOpenUmClaim", v, { shouldValidate: true })
        }
        allowUndefined={false}
      />
      {errors.permissionOpenUmClaim && (
        <p className="text-sm text-red-600 mt-1">
          {errors.permissionOpenUmClaim.message}
        </p>
      )}
      <AnimatePresence>
        {permissionOpenUmClaim === true && (
          <motion.div
            key="umCompany"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Label htmlFor="umInsuranceCompany">UM Insurance Company</Label>
            <Input
              id="umInsuranceCompany"
              {...register("umInsuranceCompany")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LostIncomeStep({
  value,
  onChange,
}: {
  value: {
    lostIncomeOrMissedWork: boolean | null;
    employerPhone?: string;
    employerAddress?: string;
  };
  onChange: (v: EmploymentLossFormData) => void;
}) {
  const {
    setValue,
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<{
    lostIncomeOrMissedWork: boolean | null;
    employerPhone?: string;
    employerAddress?: string;
  }>({
    resolver: zodResolver(employmentLossSchema),
    defaultValues: value,
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

  const lostIncomeOrMissedWork = watch("lostIncomeOrMissedWork");
  const employerPhone = watch("employerPhone");
  const employerAddress = watch("employerAddress");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({
        lostIncomeOrMissedWork,
        employerPhone,
        employerAddress,
      });
  }, [lostIncomeOrMissedWork, employerPhone, employerAddress, isValid]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BooleanField
        id="lostIncomeOrMissedWork"
        label="Lost Income/Missed Work?"
        value={lostIncomeOrMissedWork}
        onChange={(v) =>
          setValue("lostIncomeOrMissedWork", v, { shouldValidate: true })
        }
        allowUndefined={false}
      />
      {errors.lostIncomeOrMissedWork && (
        <p className="text-sm text-red-600 mt-1">
          {errors.lostIncomeOrMissedWork.message}
        </p>
      )}
      <AnimatePresence>
        {lostIncomeOrMissedWork === true && (
          <motion.div
            key="employer"
            className="grid sm:grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div>
              <Label htmlFor="employerPhone">Employer Phone</Label>
              <Input
                id="employerPhone"
                value={employerPhone || ""}
                {...register("employerPhone")}
                onChange={(e) =>
                  setValue("employerPhone", fmt(e.target.value), {
                    shouldValidate: true,
                  })
                }
              />
              {errors.employerPhone && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.employerPhone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="employerAddress">Employer Address</Label>
              <Input id="employerAddress" {...register("employerAddress")} />
              {errors.employerAddress && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.employerAddress.message}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
