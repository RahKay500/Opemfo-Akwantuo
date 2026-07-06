"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecoverForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [envPassword, setEnvPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, envPassword, newPassword, newPhone: newPhone || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-[#16A34A]">Password reset.</p>
        <p className="text-sm text-[#6B7280]">
          You can now sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/login")}
          className="h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Server phone number (SUPER_ADMIN_PHONE)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 123 4567"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Server recovery password</label>
        <input
          type="password"
          value={envPassword}
          onChange={(e) => setEnvPassword(e.target.value)}
          placeholder="SUPER_ADMIN_PASSWORD"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">
          New phone number <span className="font-normal text-[#6B7280]">(only if handing off to a new admin)</span>
        </label>
        <input
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Leave blank to keep the same number"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>

      {error && <p className="rounded-md bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Resetting…" : "Reset Password"}
      </button>
    </form>
  );
}
