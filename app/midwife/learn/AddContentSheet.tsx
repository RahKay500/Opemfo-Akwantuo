"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "@/components/ui/BottomSheet";
import FileUpload from "@/components/ui/FileUpload";
import { useVideoUpload } from "@/lib/useVideoUpload";
import { VIDEO_CATEGORIES, type VideoCategory } from "@/lib/videos";

export default function AddContentSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VideoCategory>(VIDEO_CATEGORIES[0]);
  const [mode, setMode] = useState<"link" | "upload">("link");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const upload = useVideoUpload();

  function handleClose() {
    setTitle("");
    setCategory(VIDEO_CATEGORIES[0]);
    setMode("link");
    setUrl("");
    setError(null);
    upload.reset();
    onClose();
  }

  async function handleCreate() {
    const finalUrl = mode === "upload" ? upload.result?.url : url;
    const mimeType = mode === "upload" ? upload.result?.mimeType : undefined;
    if (!title.trim() || !finalUrl) {
      setError(mode === "upload" ? "Add a title and wait for the file to finish uploading." : "Fill in all fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category, url: finalUrl, mimeType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          typeof data.error === "string"
            ? data.error
            : (data.error?.fieldErrors?.url?.[0] ?? data.error?.fieldErrors?.title?.[0] ?? "Something went wrong.")
        );
        return;
      }
      router.refresh();
      handleClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="flex flex-col gap-4 px-5 pb-6 pt-2">
        <p className="font-heading text-lg font-bold text-text-primary">Add Content</p>
        <p className="font-body text-sm text-text-secondary">
          Share a video or audio clip with mothers at your facility.
        </p>

        <div>
          <label className="font-body text-sm font-medium text-text-primary">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Preparing for Your First Antenatal Visit"
            className="mt-1.5 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-text-primary">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as VideoCategory)}
            className="mt-1.5 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
          >
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`h-10 flex-1 rounded-input border-[1.5px] text-sm font-medium ${mode === "link" ? "border-primary bg-lilac-light text-lilac-dark" : "border-border-color text-text-secondary"}`}
          >
            YouTube link
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`h-10 flex-1 rounded-input border-[1.5px] text-sm font-medium ${mode === "upload" ? "border-primary bg-lilac-light text-lilac-dark" : "border-border-color text-text-secondary"}`}
          >
            Upload file
          </button>
        </div>

        {mode === "link" ? (
          <div>
            <label className="font-body text-sm font-medium text-text-primary">YouTube link</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1.5 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>
        ) : (
          <FileUpload
            accept="video/*,audio/*"
            hint="MP4, MOV, WebM or MP3/WAV (max 200MB)"
            files={upload.file ? [upload.file] : []}
            onFilesSelected={upload.handleFilesSelected}
            onRemove={upload.reset}
          />
        )}

        {(error || upload.error) && <p className="font-body text-sm text-[#DC2626]">{error ?? upload.error}</p>}

        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="h-12 w-full rounded-button bg-primary font-heading text-base font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add Content"}
        </button>
      </div>
    </BottomSheet>
  );
}
