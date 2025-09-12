"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  damagesBillsSchema,
  damagesOtherCostsSchema,
  damagesPropertySchema,
} from "../validation";

export function PropertyDamageStep({
  value,
  onChange,
}: {
  value: {
    propertyDamage?: number;
    repair?: number;
    depreciation?: number;
    totaled?: number;
  };
  onChange: (v: any) => void;
}) {
  const {
    register,
    watch,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(damagesPropertySchema),
    defaultValues: value,
    mode: "onChange",
  });
  const propertyDamage = watch("propertyDamage");
  const repair = watch("repair");
  const depreciation = watch("depreciation");
  const totaled = watch("totaled");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({ propertyDamage, repair, depreciation, totaled });
  }, [propertyDamage, repair, depreciation, totaled, isValid]);
  return (
    <motion.div
      className="grid sm:grid-cols-2 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <Label htmlFor="propertyDamage">Property Damage (optional)</Label>
        <Input
          id="propertyDamage"
          type="number"
          step="0.01"
          min="0"
          {...register("propertyDamage")}
        />
      </div>
      <div>
        <Label htmlFor="repair">Repair (optional)</Label>
        <Input
          id="repair"
          type="number"
          step="0.01"
          min="0"
          {...register("repair")}
        />
      </div>
      <div>
        <Label htmlFor="depreciation">Depreciation (optional)</Label>
        <Input
          id="depreciation"
          type="number"
          step="0.01"
          min="0"
          {...register("depreciation")}
        />
      </div>
      <div>
        <Label htmlFor="totaled">Totaled (optional)</Label>
        <Input
          id="totaled"
          type="number"
          step="0.01"
          min="0"
          {...register("totaled")}
        />
      </div>
    </motion.div>
  );
}

export function BillsStep({
  value,
  onChange,
}: {
  value: {
    bills?: number;
    xrayBill?: number;
    ambulanceBill?: number;
    hospitalBill?: number;
  };
  onChange: (v: any) => void;
}) {
  const {
    register,
    watch,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(damagesBillsSchema),
    defaultValues: value,
    mode: "onChange",
  });
  const bills = watch("bills");
  const xrayBill = watch("xrayBill");
  const ambulanceBill = watch("ambulanceBill");
  const hospitalBill = watch("hospitalBill");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({ bills, xrayBill, ambulanceBill, hospitalBill });
  }, [bills, xrayBill, ambulanceBill, hospitalBill, isValid]);
  return (
    <motion.div
      className="grid sm:grid-cols-2 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <Label htmlFor="bills">Bills (optional)</Label>
        <Input
          id="bills"
          type="number"
          step="0.01"
          min="0"
          {...register("bills")}
        />
      </div>
      <div>
        <Label htmlFor="xrayBill">X-ray Bill (optional)</Label>
        <Input
          id="xrayBill"
          type="number"
          step="0.01"
          min="0"
          {...register("xrayBill")}
        />
      </div>
      <div>
        <Label htmlFor="ambulanceBill">Ambulance Bill (optional)</Label>
        <Input
          id="ambulanceBill"
          type="number"
          step="0.01"
          min="0"
          {...register("ambulanceBill")}
        />
      </div>
      <div>
        <Label htmlFor="hospitalBill">Hospital Bill (optional)</Label>
        <Input
          id="hospitalBill"
          type="number"
          step="0.01"
          min="0"
          {...register("hospitalBill")}
        />
      </div>
    </motion.div>
  );
}

export function OtherCostsStep({
  value,
  onChange,
}: {
  value: {
    otherMedicalCosts?: number;
    mdBills?: number;
    otherBills?: number;
    prescriptionCosts?: number;
  };
  onChange: (v: any) => void;
}) {
  const {
    register,
    watch,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(damagesOtherCostsSchema),
    defaultValues: value,
    mode: "onChange",
  });
  const otherMedicalCosts = watch("otherMedicalCosts");
  const mdBills = watch("mdBills");
  const otherBills = watch("otherBills");
  const prescriptionCosts = watch("prescriptionCosts");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({
        otherMedicalCosts,
        mdBills,
        otherBills,
        prescriptionCosts,
      });
  }, [otherMedicalCosts, mdBills, otherBills, prescriptionCosts, isValid]);
  return (
    <motion.div
      className="grid sm:grid-cols-2 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <Label htmlFor="otherMedicalCosts">
          Other Medical Costs (optional)
        </Label>
        <Input
          id="otherMedicalCosts"
          type="number"
          step="0.01"
          min="0"
          {...register("otherMedicalCosts")}
        />
      </div>
      <div>
        <Label htmlFor="mdBills">M.D. Bills (optional)</Label>
        <Input
          id="mdBills"
          type="number"
          step="0.01"
          min="0"
          {...register("mdBills")}
        />
      </div>
      <div>
        <Label htmlFor="otherBills">Other Bills (optional)</Label>
        <Input
          id="otherBills"
          type="number"
          step="0.01"
          min="0"
          {...register("otherBills")}
        />
      </div>
      <div>
        <Label htmlFor="prescriptionCosts">Prescription Costs (optional)</Label>
        <Input
          id="prescriptionCosts"
          type="number"
          step="0.01"
          min="0"
          {...register("prescriptionCosts")}
        />
      </div>
    </motion.div>
  );
}
