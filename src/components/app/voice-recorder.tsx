import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import AudioVisualizer from "./audio-visualizer";
import MicrophoneButton from "./microphone-button";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onClose: () => void;
  onSave?: (transcript: string) => void;
  saveLabel?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onClose, onSave, saveLabel }) => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const { startRecording, stopRecording, audioLevel, isRecording } =
    useVoiceRecording({
      onTranscript: setTranscript,
      onListeningChange: setIsListening,
    });

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSave = useCallback(() => {
    try {
      if (isRecording) stopRecording();
      const t = transcript.trim();
      if (t && onSave) onSave(t);
    } finally {
      onClose();
    }
  }, [isRecording, stopRecording, transcript, onSave, onClose]);

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
        aria-label="Close voice recorder"
      >
        <X size={24} />
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Transcript display */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="min-h-[200px] flex items-center justify-center">
            {transcript ? (
              <p className="text-gray-800 text-xl leading-relaxed text-center whitespace-pre-wrap">
                {transcript}
              </p>
            ) : (
              <p className="text-gray-500 text-lg text-center">
                {isListening
                  ? "Listening..."
                  : "Tap the microphone to start recording"}
              </p>
            )}
          </div>
        </div>

        {/* Audio visualizer */}
        <div className="mb-16">
          <AudioVisualizer audioLevel={audioLevel} isActive={isRecording} />
        </div>

        {/* Microphone button */}
        <MicrophoneButton
          isRecording={isRecording}
          isListening={isListening}
          onToggle={handleToggleRecording}
        />

        {/* Save */}
        <div className="mt-10">
          <Button onClick={handleSave} disabled={!transcript.trim()}>
            {saveLabel ?? "Save Check-in"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
