"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "@/components/app/voice-recorder";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Mic } from "lucide-react";

export interface IncidentVoiceProps {
  transcript?: string;
  onSave: (transcript: string) => void;
}

export function IncidentVoice({ transcript, onSave }: IncidentVoiceProps) {
  const [showVoice, setShowVoice] = useState(false);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
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
            Speak about when and how the incident occurred. Include date,
            location, and what happened.
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Button onClick={() => setShowVoice(true)}>
            <Mic size={16} />
            {transcript ? "Re-record" : "Open Voice Recorder"}
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
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <VoiceRecorder
              onClose={() => setShowVoice(false)}
              onSave={(t) => {
                onSave(t);
                setShowVoice(false);
              }}
              saveLabel="Save Incident"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
