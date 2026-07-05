"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountRow() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch("/api/mother/account", { method: "DELETE" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div className="flex h-14 w-full items-center justify-center gap-3 px-4">
        <span className="font-body text-sm text-text-secondary">Delete your account?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="font-body text-sm font-medium text-[#DC2626] disabled:opacity-60"
        >
          {loading ? "Deleting…" : "Confirm"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="font-body text-sm text-text-secondary">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex h-14 w-full items-center justify-center font-body text-sm text-[#9CA3AF]"
    >
      Delete Account
    </button>
  );
}
