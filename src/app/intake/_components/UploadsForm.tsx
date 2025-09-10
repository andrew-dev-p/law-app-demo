"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "../model";

export interface UploadsFormProps {
  uploads: UploadItem[];
  onFileChange: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}

export function UploadsForm({ uploads, onFileChange, onRemove }: UploadsFormProps) {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="files">Upload documents</Label>
        <input
          id="files"
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent"
          onChange={(e) => onFileChange(e.target.files)}
        />
        <p className="text-xs text-muted-foreground mt-1">Accepted: PDF, images. Max 10MB each (demo only).</p>
      </div>
      <div className="divide-y border rounded-md">
        {uploads.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No files added yet.</div>
        )}
        {uploads.map((u) => (
          <div key={u.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{u.name}</div>
              <div className="text-xs text-muted-foreground">{(u.size / 1024).toFixed(1)} KB</div>
            </div>
            <Button variant="ghost" onClick={() => onRemove(u.id)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

