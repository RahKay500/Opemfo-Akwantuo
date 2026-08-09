"use client";

import { useState } from "react";
import FormField from "@/components/admin/FormField";

export default function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ recipientCount: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Enter a title.";
    if (!message.trim()) errors.message = "Enter a message.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setSuccess({ recipientCount: data.data.recipientCount });
      setTitle("");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Title" required error={fieldErrors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. MoH training this week"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Message" required error={fieldErrors.message}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write the notice to send to every Facility Admin..."
          className="rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
      {success && (
        <p className="text-sm text-[#16A34A]">
          Sent to {success.recipientCount} {success.recipientCount === 1 ? "Facility Admin" : "Facility Admins"}.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 h-11 rounded-md bg-[#9F1AB1] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send Broadcast"}
      </button>
    </form>
  );
}
