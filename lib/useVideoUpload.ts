"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { formatFileSize } from "@/lib/utils";
import type { FileUploadFile } from "@/components/ui/FileUpload";

// Shared client-side upload flow for Learn & Prepare content, used by both
// the Admin and Midwife "Add Content" forms. Uploads go straight from the
// browser to Vercel Blob (see app/api/uploads/video/route.ts for the token
// endpoint), bypassing the ~4.5MB serverless request-body limit a normal API
// route would hit for anything but the smallest clips.
export function useVideoUpload() {
  const [file, setFile] = useState<FileUploadFile | null>(null);
  const [result, setResult] = useState<{ url: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesSelected(files: FileList) {
    const selected = files[0];
    if (!selected) return;

    setError(null);
    setResult(null);
    const id = crypto.randomUUID();
    setFile({ id, name: selected.name, sizeLabel: formatFileSize(selected.size), progress: 0, status: "uploading" });

    try {
      const blob = await upload(selected.name, selected, {
        access: "public",
        handleUploadUrl: "/api/uploads/video",
        onUploadProgress: ({ percentage }) => {
          setFile((current) => (current ? { ...current, progress: Math.round(percentage) } : current));
        },
      });
      setFile((current) => (current ? { ...current, status: "complete", progress: 100 } : current));
      setResult({ url: blob.url, mimeType: selected.type });
    } catch (err) {
      setFile((current) => (current ? { ...current, status: "error" } : current));
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  return { file, result, error, handleFilesSelected, reset };
}
