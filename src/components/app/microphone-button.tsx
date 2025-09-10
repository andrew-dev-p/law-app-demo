import React from "react";
import { Mic, Square } from "lucide-react";

interface MicrophoneButtonProps {
  isRecording: boolean;
  isListening: boolean;
  onToggle: () => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isRecording,
  isListening,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-20 h-20 rounded-full transition-all duration-300 ease-out
        ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25 border-2 border-red-400"
            : "bg-white hover:bg-gray-50 shadow-lg shadow-gray-300/20 border-2 border-gray-200"
        }
        ${isListening ? "scale-110" : "scale-100"}
        active:scale-95
      `}
    >
      {/* Animated ring when recording */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
      )}

      {/* Icon */}
      <div className="flex items-center justify-center h-full">
        {isRecording ? (
          <Square size={24} className="text-white fill-current" />
        ) : (
          <Mic size={24} className="text-gray-600" />
        )}
      </div>

      {/* Subtle pulse animation when listening but not recording */}
      {isListening && !isRecording && (
        <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse opacity-40" />
      )}
    </button>
  );
};

export default MicrophoneButton;
