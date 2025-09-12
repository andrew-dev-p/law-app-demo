"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BooleanField } from "@/components/ui/boolean-field";
import { attorneySchema, witnessesSchema } from "../validation";

export function WitnessesStep({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: { witnesses?: string }) => void;
}) {
  const {
    register,
    watch,
    formState: { isValid },
  } = useForm<{ witnesses?: string }>({
    resolver: zodResolver(witnessesSchema),
    defaultValues: { witnesses: value || "" },
    mode: "onChange",
  });
  const witnesses = watch("witnesses");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid) onChangeRef.current({ witnesses });
  }, [witnesses, isValid]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Label htmlFor="witnesses">
        Witnesses (Names, Addresses, Phone Numbers) (optional)
      </Label>
      <Input id="witnesses" {...register("witnesses")} />
    </motion.div>
  );
}

export function AttorneyStep({
  value,
  onChange,
}: {
  value: {
    spokeToAnotherAttorney: boolean | null;
    attorneyNameAddress?: string;
  };
  onChange: (v: any) => void;
}) {
  const {
    setValue,
    register,
    watch,
    formState: { isValid, errors },
  } = useForm<{
    spokeToAnotherAttorney: boolean | null;
    attorneyNameAddress?: string;
  }>({
    resolver: zodResolver(attorneySchema),
    defaultValues: value,
    mode: "onChange",
  });
  const spokeToAnotherAttorney = watch("spokeToAnotherAttorney");
  const attorneyNameAddress = watch("attorneyNameAddress");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (isValid)
      onChangeRef.current({ spokeToAnotherAttorney, attorneyNameAddress });
  }, [spokeToAnotherAttorney, attorneyNameAddress, isValid]);
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BooleanField
        id="spokeToAnotherAttorney"
        label="Spoke to Another Attorney?"
        value={spokeToAnotherAttorney}
        onChange={(v) =>
          setValue("spokeToAnotherAttorney", v, { shouldValidate: true })
        }
        allowUndefined={false}
      />
      {errors.spokeToAnotherAttorney && (
        <p className="text-sm text-red-600 mt-1">
          {String(errors.spokeToAnotherAttorney.message)}
        </p>
      )}
      <AnimatePresence>
        {spokeToAnotherAttorney === true && (
          <motion.div
            key="attorney"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Label htmlFor="attorneyNameAddress">
              Attorney’s Name & Address
            </Label>
            <Input
              id="attorneyNameAddress"
              {...register("attorneyNameAddress")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
