"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UploadItem } from "../model";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageViewer } from "@/components/app/image-viewer";

export interface UploadsFormProps {
  uploads: UploadItem[];
  onFileChange: (
    files: FileList | null,
    category?: UploadItem["category"]
  ) => void;
  onRemove: (id: string) => void;
}

export function UploadsForm({
  uploads,
  onFileChange,
  onRemove,
}: UploadsFormProps) {
  const [q, setQ] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const questions = useMemo(
    () => [
      {
        key: "license" as const,
        label: "Please upload a photo of your driver's license.",
        accept: "image/*,application/pdf",
        multiple: false,
        valid: uploads.some((u) => u.category === "license"),
      },
      {
        key: "insurance" as const,
        label: "Please upload your insurance cards (front/back).",
        accept: "image/*,application/pdf",
        multiple: true,
        valid: uploads.some((u) => u.category === "insurance"),
      },
      {
        key: "evidence" as const,
        label: "Upload any photos of the accident or your injuries.",
        accept: "image/*",
        multiple: true,
        valid: uploads.some((u) => u.category === "evidence"),
      },
    ],
    [uploads]
  );

  // Only show files from the current question's category
  const categoryItems = useMemo(
    () => uploads.filter((u) => u.category === (questions[q]?.key ?? "")),
    [uploads, q, questions] // depends on current question index
  );
  const imageItems = useMemo(
    () =>
      categoryItems.filter((u) => (u.mime || "").startsWith("image/") && u.url),
    [categoryItems]
  );

  const next = useCallback(
    () => setQ((i) => Math.min(i + 1, questions.length - 1)),
    [questions.length]
  );
  const back = useCallback(() => setQ((i) => Math.max(i - 1, 0)), []);
  const current = questions[q];

  // Global Enter handler to advance when valid
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "BUTTON" ||
          active.getAttribute("data-inner-nav") === "true")
      )
        return;
      if (current.valid && q < questions.length - 1) {
        e.preventDefault();
        next();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current.valid, q, questions.length, next]);

  const onPick = (files: FileList | null) => {
    if (!files) return;
    onFileChange(files, current.key);
  };

  const typeBadge = (u: UploadItem) => {
    const mime = u.mime || "";
    const kind = mime.startsWith("image/")
      ? "img"
      : mime === "application/pdf" || u.name.toLowerCase().endsWith(".pdf")
      ? "pdf"
      : "file";
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium border",
          kind === "img" && "bg-emerald-50 text-emerald-700 border-emerald-200",
          kind === "pdf" && "bg-rose-50 text-rose-700 border-rose-200",
          kind === "file" && "bg-slate-50 text-slate-700 border-slate-200"
        )}
      >
        {kind.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="grid gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={q}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid gap-3"
        >
          <div className="flex items-center justify-between">
            <Label htmlFor={`files-${current.key}`} className="text-sm">
              {current.label}
            </Label>
            <span className="text-[11px] text-muted-foreground">
              Question {q + 1} of {questions.length}
            </span>
          </div>

          <div>
            <input
              id={`files-${current.key}`}
              type="file"
              accept={current.accept}
              multiple={current.multiple}
              className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent"
              onChange={(e) => onPick(e.target.files)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Accepted: images and PDFs where applicable. Max 10MB each (demo).
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Preview grid for images */}
      {imageItems.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2">Images</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {imageItems.map((u, idx) => (
              <div
                key={u.id}
                className="group relative overflow-hidden rounded-md border border-border"
              >
                <button
                  type="button"
                  className="block w-full aspect-[4/3] overflow-hidden bg-muted"
                  onClick={() => setViewerIndex(idx)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.url}
                    alt={u.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                </button>
                <div className="absolute left-1 top-1 flex items-center gap-1">
                  {typeBadge(u)}
                </div>
                <button
                  type="button"
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded bg-background/80 backdrop-blur border border-border text-xs opacity-0 group-hover:opacity-100"
                  onClick={() => onRemove(u.id)}
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-image files list */}
      {categoryItems.some((u) => !(u.mime || "").startsWith("image/")) && (
        <div>
          <div className="text-xs font-medium mb-2">Other Files</div>
          <div className="divide-y rounded-md border border-border">
            {categoryItems
              .filter((u) => !(u.mime || "").startsWith("image/"))
              .map((u) => (
                <div
                  key={u.id}
                  className="p-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium max-w-[220px]">
                        {u.name}
                      </div>
                      {typeBadge(u)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(u.size / 1024).toFixed(1)} KB{" "}
                      {u.category ? `• ${u.category}` : ""}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => onRemove(u.id)}>
                    Remove
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <Button
          variant="link"
          size="sm"
          onClick={back}
          disabled={q === 0}
          data-inner-nav="true"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous question
        </Button>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] text-muted-foreground">
            Press Enter to continue
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={!current.valid || q === questions.length - 1}
            data-inner-nav="true"
          >
            Next question <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <ImageViewer
        open={viewerIndex !== null}
        images={imageItems.map((u) => ({ src: u.url!, alt: u.name }))}
        index={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        onNavigate={(i) => setViewerIndex(i)}
      />
    </div>
  );
}
