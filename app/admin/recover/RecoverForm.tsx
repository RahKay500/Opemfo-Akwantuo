"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

export default function RecoverForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [envPassword, setEnvPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showEnvPassword, setShowEnvPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        body: JSON.stringify({ email, envPassword, newPassword, newEmail: newEmail || undefined }),
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
        <label className="text-sm font-medium text-[#1A1A2E]">Server email address (SUPER_ADMIN_EMAIL)</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@company.com"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Server recovery password</label>
        <div className="relative">
          <input
            type={showEnvPassword ? "text" : "password"}
            value={envPassword}
            onChange={(e) => setEnvPassword(e.target.value)}
            placeholder="SUPER_ADMIN_PASSWORD"
            className="h-11 w-full rounded-md border border-[#E2E8F0] px-3.5 pr-10 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
          />
          <button
            type="button"
            onClick={() => setShowEnvPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
            aria-label={showEnvPassword ? "Hide password" : "Show password"}
          >
            {showEnvPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">
          New email <span className="font-normal text-[#6B7280]">(only if handing off to a new admin)</span>
        </label>
        <input
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Leave blank to keep the same email"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">New password</label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-11 w-full rounded-md border border-[#E2E8F0] px-3.5 pr-10 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Confirm new password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11 w-full rounded-md border border-[#E2E8F0] px-3.5 pr-10 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
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
