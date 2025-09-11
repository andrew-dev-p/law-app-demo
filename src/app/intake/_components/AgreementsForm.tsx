"use client";

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import type { Agreement, IntakeState } from "../model";

export enum AgreementSection {
  Hipaa = "hipaa",
  Representation = "representation",
  Fee = "fee",
  All = "all",
}

export interface AgreementsFormProps {
  value: IntakeState["agreements"];
  onChange: (next: IntakeState["agreements"]) => void;
  section?: AgreementSection;
}

export function AgreementsForm({
  value,
  onChange,
  section = AgreementSection.All,
}: AgreementsFormProps) {
  const update = (
    section: keyof typeof value,
    field: keyof Agreement,
    v: string | boolean
  ) => {
    onChange({
      ...value,
      [section]: {
        ...value[section],
        [field]: v,
      },
    });
  };

  const renderAgreement = (
    sectionKey: keyof typeof value,
    description: string,
    delay: number = 0
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      }}
    >
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.3 }}
      >
        {description}
      </motion.p>
      <motion.div
        className="mt-3 grid sm:grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
      >
        <div>
          <Label htmlFor={`${sectionKey}-initials`}>Initials</Label>
          <Input
            id={`${sectionKey}-initials`}
            value={value[sectionKey].initials}
            onChange={(e) => update(sectionKey, "initials", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${sectionKey}-date`}>Date</Label>
          <DatePicker
            id={`${sectionKey}-date`}
            value={value[sectionKey].date}
            onChange={(v) => update(sectionKey, "date", v)}
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm mb-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={value[sectionKey].agreed}
              onChange={(e) => update(sectionKey, "agreed", e.target.checked)}
            />
            I agree
          </label>
        </div>
      </motion.div>
    </motion.div>
  );

  const sectionConfigs = {
    [AgreementSection.Hipaa]: {
      render: () =>
        renderAgreement(
          "hipaa",
          "I authorize the release of my medical information to my attorneys for purposes of my claim."
        ),
    },
    [AgreementSection.Representation]: {
      render: () =>
        renderAgreement(
          "representation",
          "I retain the firm to represent me regarding my personal injury matter.",
          0.1
        ),
    },
    [AgreementSection.Fee]: {
      render: () =>
        renderAgreement(
          "fee",
          "Fees are contingent on recovery and will be calculated per our agreement.",
          0.2
        ),
    },
  };

  const config = sectionConfigs[section as keyof typeof sectionConfigs];
  if (config) {
    return config.render();
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {sectionConfigs[AgreementSection.Hipaa].render()}
      {sectionConfigs[AgreementSection.Representation].render()}
      {sectionConfigs[AgreementSection.Fee].render()}
    </motion.div>
  );
}
