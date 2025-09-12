"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "@/components/app/voice-recorder";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Mic } from "lucide-react";

export interface MedicalVoiceProps {
  transcript?: string;
  onSave: (transcript: string) => void;
}

export function MedicalVoice({ transcript, onSave }: MedicalVoiceProps) {
  const [showVoice, setShowVoice] = useState(false);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div>
          <motion.div
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Speak about your injuries, any doctor visits, and referral needs.
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Button onClick={() => setShowVoice(true)}>
            <Mic size={16} />
            {transcript ? "Speak to Agent (Rewrite)" : "Speak to Agent"}
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {transcript ? (
          <motion.div
            key="transcript"
            className="rounded-md border border-gray-200 p-3 text-sm whitespace-pre-wrap italic"
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
            <CardDescription>No conversation yet.</CardDescription>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoice && (
          <motion.div
            key="voice-modal"
            className="fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VoiceRecorder
              onClose={() => setShowVoice(false)}
              onSave={(t) => {
                onSave(t);
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
