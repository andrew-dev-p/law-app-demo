"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageViewerProps {
  open: boolean;
  images: { src: string; alt?: string }[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageViewer({
  open,
  images,
  index,
  onClose,
  onNavigate,
}: ImageViewerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        onNavigate(Math.min(images.length - 1, index + 1));
      if (e.key === "ArrowLeft") onNavigate(Math.max(0, index - 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, images.length, index, onClose, onNavigate]);

  if (!open || images.length === 0) return null;

  const img = images[Math.max(0, Math.min(index, images.length - 1))];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 hidden items-center justify-center md:flex",
        open && "md:flex"
      )}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 mx-4 max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.src}
          alt={img.alt || "Image"}
          className="max-h-[85vh] max-w-[85vw] rounded-md shadow-2xl"
        />
        <div className="absolute -top-10 right-0 flex items-center gap-2">
          <button
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-foreground hover:bg-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute inset-y-0 -left-12 hidden md:flex items-center">
          <button
            aria-label="Previous"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-foreground hover:bg-white disabled:opacity-50"
            onClick={() => onNavigate(Math.max(0, index - 1))}
            disabled={index === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute inset-y-0 -right-12 hidden md:flex items-center">
          <button
            aria-label="Next"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-foreground hover:bg-white disabled:opacity-50"
            onClick={() => onNavigate(Math.min(images.length - 1, index + 1))}
            disabled={index >= images.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
