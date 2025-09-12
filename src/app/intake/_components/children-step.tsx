"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { childrenInfoSchema } from "../validation";

interface ChildrenStepProps {
  value: {
    numberOfChildren?: number | null;
    childrenAges?: string;
    minorCompanionsNames?: string;
  };
  onChange: (val: ChildrenStepProps["value"]) => void;
}

export function ChildrenStep({ value, onChange }: ChildrenStepProps) {
  const {
    register,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<ChildrenStepProps["value"]>({
    resolver: zodResolver(childrenInfoSchema),
    defaultValues: value,
    mode: "onChange",
  });

  const watched = watch();
  useEffect(() => {
    if (!isValid) return;
    const equal =
      (watched.numberOfChildren ?? null) === (value.numberOfChildren ?? null) &&
      (watched.childrenAges || "") === (value.childrenAges || "") &&
      (watched.minorCompanionsNames || "") ===
        (value.minorCompanionsNames || "");
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
        <Label htmlFor="numberOfChildren">Number of Children (optional)</Label>
        <Input
          id="numberOfChildren"
          type="number"
          min={0}
          step={1}
          value={watched.numberOfChildren ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              setValue("numberOfChildren", null, { shouldValidate: true });
              return;
            }
            const n = Number(raw);
            if (Number.isNaN(n)) return;
            setValue("numberOfChildren", Math.max(0, Math.trunc(n)), {
              shouldValidate: true,
            });
          }}
        />
      </div>
      <div>
        <Label htmlFor="childrenAges">Children’s Ages (optional)</Label>
        <Input id="childrenAges" {...register("childrenAges")} />
      </div>
      <div>
        <Label htmlFor="minorCompanionsNames">
          Names of Minor Companions (optional)
        </Label>
        <Input
          id="minorCompanionsNames"
          {...register("minorCompanionsNames")}
        />
      </div>
    </motion.div>
  );
}
