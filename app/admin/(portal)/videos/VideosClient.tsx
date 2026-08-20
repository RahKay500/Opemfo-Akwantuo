"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import RowActionsMenu, { RowActionItem } from "@/components/admin/RowActionsMenu";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { VIDEO_CATEGORIES } from "@/lib/videos";

export interface VideoRow {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
}

interface FormState {
  title: string;
  url: string;
  category: (typeof VIDEO_CATEGORIES)[number];
}

const EMPTY_FORM: FormState = { title: "", url: "", category: "Pregnancy" };

export default function VideosClient({ videos }: { videos: VideoRow[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VideoRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function closeModals() {
    setAddOpen(false);
    setDeleteTarget(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleCreate() {
    setError(null);
    if (!form.title.trim() || !form.url.trim()) {
      setError("Fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setError(
          typeof data.error === "string"
            ? data.error
            : (data.error?.fieldErrors?.url?.[0] ?? data.error?.fieldErrors?.title?.[0] ?? "Something went wrong.")
        );
        return;
      }
      closeModals();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/videos/${deleteTarget.id}`, { method: "DELETE" });
      closeModals();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const columns: DataTableColumn<VideoRow>[] = [
    { key: "title", header: "Title", render: (r) => <span className="font-medium text-[#1A1A2E]">{r.title}</span> },
    {
      key: "category",
      header: "Category",
      width: "160px",
      render: (r) => (
        <span className="inline-block rounded-full bg-[#FBE8FF] px-2.5 py-1 text-center text-xs font-medium text-[#9F1AB1]">
          {r.category}
        </span>
      ),
    },
    {
      key: "url",
      header: "Link",
      render: (r) => (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[#2663EB] hover:underline"
        >
          Watch on YouTube ↗
        </a>
      ),
    },
    { key: "createdAt", header: "Added", width: "140px", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      header: "",
      width: "56px",
      render: (r) => (
        <RowActionsMenu>
          <RowActionItem onClick={() => setDeleteTarget(r)} tone="danger">
            Delete
          </RowActionItem>
        </RowActionsMenu>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#1A1A2E]">
          {videos.length} {videos.length === 1 ? "Video" : "Videos"}
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setError(null);
            setAddOpen(true);
          }}
          className="h-10 shrink-0 rounded-md bg-[#9F1AB1] px-4 text-sm font-semibold text-white"
        >
          + Add Video
        </button>
      </div>

      <DataTable columns={columns} rows={videos} rowKey={(r) => r.id} emptyMessage="No videos added yet." />

      <Modal
        open={addOpen}
        onClose={closeModals}
        title="Add Video"
        actions={
          <>
            <button
              type="button"
              onClick={closeModals}
              className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add Video"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Title" required>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Preparing for Your First Antenatal Visit"
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
            />
          </FormField>
          <FormField label="YouTube link" required>
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
            />
          </FormField>
          <FormField label="Category" required>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FormState["category"] }))}
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
            >
              {VIDEO_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          {error && <p className="text-sm text-[#DC2626]">{error}</p>}
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={closeModals}
        title="Delete Video"
        actions={
          <>
            <button
              type="button"
              onClick={closeModals}
              className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]"
            >
              Cancel
            </button>
            <Button size="admin-sm" hierarchy="danger" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280]">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? Mothers will no longer see it in
          Learn &amp; Prepare.
        </p>
      </Modal>
    </>
  );
}
