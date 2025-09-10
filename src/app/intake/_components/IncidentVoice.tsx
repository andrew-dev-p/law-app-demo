"use client";

import { useState } from "react";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Speak about when and how the incident occurred. Include date, location, and what happened.
          </div>
        </div>
        <Button onClick={() => setShowVoice(true)}>
          <Mic size={16} />
          {transcript ? "Re-record" : "Open Voice Recorder"}
        </Button>
      </div>

      {transcript ? (
        <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">
          {transcript}
        </div>
      ) : (
        <CardDescription>No recording saved yet.</CardDescription>
      )}

      {showVoice && (
        <div className="fixed inset-0 z-50 bg-white">
          <VoiceRecorder
            onClose={() => setShowVoice(false)}
            onSave={(t) => {
              onSave(t);
              setShowVoice(false);
            }}
            saveLabel="Save Incident"
          />
        </div>
      )}
    </div>
  );
}
