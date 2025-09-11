"use client";

import { JSX, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UploadItem } from "../model";
import { Trash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageViewer } from "@/components/app/image-viewer";

export enum UploadSection {
  License = "license",
  Insurance = "insurance",
  Evidence = "evidence",
  All = "all",
}

export interface UploadsFormProps {
  uploads: UploadItem[];
  onUpload: (items: UploadItem[]) => void;
  onRemove: (id: string) => void;
  section?: UploadSection;
}

export function UploadsForm({
  uploads,
  onUpload,
  onRemove,
  section = UploadSection.All,
}: UploadsFormProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const defs = useMemo(
    () => [
      {
        key: "license" as keyof UploadItem["category"],
        label: "Please upload a photo of your driver's license.",
        accept: "image/*,application/pdf",
        multiple: false,
      },
      {
        key: "insurance" as keyof UploadItem["category"],
        label: "Please upload your insurance cards (front/back).",
        accept: "image/*,application/pdf",
        multiple: true,
      },
      {
        key: "evidence" as keyof UploadItem["category"],
        label: "Upload any photos of the accident or your injuries.",
        accept: "image/*,application/pdf",
        multiple: true,
      },
    ],
    []
  );

  const onPick =
    (category: UploadItem["category"]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const items: UploadItem[] = Array.from(files).map((f) => {
        const nameLower = f.name.toLowerCase();
        const isImageByExt = /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.heic)$/.test(
          nameLower
        );
        const isPdfByExt = /\.pdf$/.test(nameLower);
        const isImage = f.type.startsWith("image/") || isImageByExt;
        return {
          id: crypto.randomUUID(),
          name: f.name,
          size: f.size,
          mime:
            f.type ||
            (isImageByExt
              ? "image/*"
              : isPdfByExt
              ? "application/pdf"
              : undefined),
          url: isImage ? URL.createObjectURL(f) : undefined,
          category,
        } as UploadItem;
      });

      onUpload(items);
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

  const renderUploadSection = (def: (typeof defs)[0]) => {
    const categoryItems = uploads.filter((u) => u.category === def.key);
    const imageItems = categoryItems.filter(
      (u) => (u.mime || "").startsWith("image/") && u.url
    );

    return (
      <motion.div
        key={def.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="space-y-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <input
            id={`files-${def.key}`}
            type="file"
            accept={def.accept}
            multiple={def.multiple}
            className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent"
            onChange={onPick(def.key)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Accepted: images and PDFs where applicable. Max 10MB each (demo).
          </p>
        </motion.div>

        {/* Preview grid for images */}
        {imageItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
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
          </motion.div>
        )}

        {/* Non-image files list */}
        {categoryItems.some((u) => !(u.mime || "").startsWith("image/")) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
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
                      <Trash />
                      Remove
                    </Button>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderLicense = () => renderUploadSection(defs[0]);
  const renderInsurance = () => renderUploadSection(defs[1]);
  const renderEvidence = () => renderUploadSection(defs[2]);

  const renderSectionWithViewer = (
    sectionToRender: () => JSX.Element,
    category: UploadItem["category"]
  ) => (
    <div className="grid gap-4">
      {sectionToRender()}
      <ImageViewer
        open={viewerIndex !== null}
        images={uploads
          .filter(
            (u) =>
              u.category === category &&
              (u.mime || "").startsWith("image/") &&
              u.url
          )
          .map((u) => ({ src: u.url!, alt: u.name }))}
        index={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        onNavigate={(i) => setViewerIndex(i)}
      />
    </div>
  );

  if (section === UploadSection.License)
    return renderSectionWithViewer(renderLicense, "license");

  if (section === UploadSection.Insurance)
    return renderSectionWithViewer(renderInsurance, "insurance");

  if (section === UploadSection.Evidence)
    return renderSectionWithViewer(renderEvidence, "evidence");

  return (
    <div className="grid gap-4">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderLicense()}
        {renderInsurance()}
        {renderEvidence()}
      </motion.div>

      <ImageViewer
        open={viewerIndex !== null}
        images={uploads
          .filter((u) => (u.mime || "").startsWith("image/") && u.url)
          .map((u) => ({ src: u.url!, alt: u.name }))}
        index={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        onNavigate={(i) => setViewerIndex(i)}
      />
    </div>
  );
}
