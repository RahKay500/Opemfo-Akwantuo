"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, NavVideosIcon, VolumeHighIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils";
import AddContentSheet from "./AddContentSheet";

export interface LearnVideoRow {
  id: string;
  title: string;
  url: string;
  mimeType: string | null;
  category: string;
  createdAt: string;
}

export default function LearnClient({ videos }: { videos: LearnVideoRow[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LearnVideoRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/videos/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-5 pb-8 pt-5 lg:px-8">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-semibold text-text-primary">
          {videos.length} {videos.length === 1 ? "item" : "items"} you&apos;ve added
        </p>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex h-10 items-center gap-1.5 rounded-button bg-primary px-4 font-body text-sm font-bold text-white"
        >
          <PlusIcon className="size-4" />
          Add Content
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-color bg-white px-5 py-10 text-center">
          <p className="font-body text-sm text-text-secondary">
            Nothing added yet. Share a video or audio clip for mothers at your facility.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-3 rounded-card border border-border-color bg-white p-3"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-badge bg-lilac-light text-lilac-dark">
                {video.mimeType?.startsWith("audio/") ? (
                  <VolumeHighIcon className="size-5" />
                ) : (
                  <NavVideosIcon className="size-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-bold text-text-primary">{video.title}</p>
                <p className="mt-0.5 font-body text-xs text-text-secondary">
                  {video.category} · {formatDate(video.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(video)}
                aria-label="Delete"
                className="flex size-9 shrink-0 items-center justify-center rounded-badge text-text-secondary hover:bg-lilac-light/50"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddContentSheet open={addOpen} onClose={() => setAddOpen(false)} />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm rounded-card bg-white p-5">
            <p className="font-heading text-base font-bold text-text-primary">Delete this content?</p>
            <p className="mt-1 font-body text-sm text-text-secondary">
              Mothers at your facility will no longer see &quot;{deleteTarget.title}&quot; in Learn &amp; Prepare.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-11 flex-1 rounded-button border border-border-color font-body text-sm font-semibold text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-11 flex-1 rounded-button bg-critical font-body text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
