"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "@/components/app/voice-recorder";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic } from "lucide-react";
import type { MedicalInfo } from "../model";

export interface MedicalVoiceProps {
  value: MedicalInfo;
  onSave: (next: Partial<MedicalInfo>) => void;
}

const INJURY_MAP: { key: MedicalInfo["injuries"][number]; cues: string[] }[] = [
  { key: "Head/Neck", cues: ["head", "neck", "concussion", "whiplash"] },
  { key: "Back", cues: ["back", "spine", "lumbar", "thoracic"] },
  { key: "Shoulder", cues: ["shoulder", "rotator", "ac joint"] },
  { key: "Arm/Hand", cues: ["arm", "hand", "wrist", "elbow"] },
  { key: "Hip/Leg", cues: ["hip", "leg", "thigh", "knee"] },
  { key: "Ankle/Foot", cues: ["ankle", "foot", "heel", "toe"] },
  { key: "Other", cues: ["bruise", "laceration", "cut", "sprain"] },
];

function extractMedical(text: string, current: MedicalInfo): Partial<MedicalInfo> {
  const t = text.toLowerCase();
  const next: Partial<MedicalInfo> = {};

  // Injuries
  const injuries = new Set(current.injuries);
  for (const m of INJURY_MAP) {
    if (m.cues.some((c) => t.includes(c))) injuries.add(m.key);
  }
  if (injuries.size > 0) next.injuries = Array.from(injuries);

  // Seen doctor
  if (/\b(saw|seen|visited|went to) (a |the )?doctor\b/.test(t) || /\ber\s*yes\b/.test(t)) {
    next.seenDoctor = "yes";
  } else if (/\bno (doctor|visit)\b/.test(t) || /\bnot yet\b/.test(t)) {
    next.seenDoctor = "no";
  }

  // Need referral
  if (/\b(referral|refer|find a provider|help me find)\b/.test(t)) {
    next.needReferral = true;
  } else if (/\bdon't need a referral|no referral\b/.test(t)) {
    next.needReferral = false;
  }

  // Provider type
  const providerMatch = t.match(/(chiropractor|pcp|primary care|physical therapy|pt|orthopedic|orthopedist)/);
  if (providerMatch) {
    const p = providerMatch[1];
    next.preferredProvider = p === "pt" ? "Physical Therapy" : p.replace(/\bpcp\b/, "Primary Care");
  }

  // City (naive capture after "in ")
  const cityMatch = text.match(/\bin\s+([A-Z][A-Za-z\s]+)(?:\.|,|$)/);
  if (cityMatch) next.city = cityMatch[1].trim();

  return next;
}

export function MedicalVoice({ value, onSave }: MedicalVoiceProps) {
  const [showVoice, setShowVoice] = useState(false);
  const [transcript, setTranscript] = useState<string | undefined>(undefined);
  const applied = useMemo(() => (transcript ? extractMedical(transcript, value) : {}), [transcript, value]);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div>
          <motion.div
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Describe your injuries, whether you saw a doctor, and if you need a referral. You can mention preferred provider and city.
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <Button onClick={() => setShowVoice(true)}>
            <Mic size={16} /> {transcript ? "Re-record" : "Open Voice Recorder"}
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {transcript ? (
          <motion.div
            key="transcript"
            className="rounded-md border p-3 text-sm whitespace-pre-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {transcript}
            <div className="mt-2 flex flex-wrap gap-1">
              {applied.injuries && applied.injuries.length > 0 && (
                <Badge variant="outline">Injuries: {applied.injuries.join(", ")}</Badge>
              )}
              {applied.seenDoctor && (
                <Badge variant="outline">Seen Doctor: {applied.seenDoctor}</Badge>
              )}
              {typeof applied.needReferral === "boolean" && (
                <Badge variant="outline">Referral: {applied.needReferral ? "Yes" : "No"}</Badge>
              )}
              {applied.preferredProvider && (
                <Badge variant="outline">Provider: {applied.preferredProvider}</Badge>
              )}
              {applied.city && <Badge variant="outline">City: {applied.city}</Badge>}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-transcript"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CardDescription>No recording saved yet.</CardDescription>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoice && (
          <motion.div
            key="voice-modal"
            className="fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <VoiceRecorder
              onClose={() => setShowVoice(false)}
              onSave={(t) => {
                setTranscript(t);
                const extracted = extractMedical(t, value);
                if (Object.keys(extracted).length > 0) onSave(extracted);
                setShowVoice(false);
              }}
              saveLabel="Save Medical"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

