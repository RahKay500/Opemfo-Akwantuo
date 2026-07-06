"use client";

import { useState } from "react";
import FormField from "@/components/admin/FormField";

export default function ChangePasswordForm() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(
          typeof data.error === "string"
            ? data.error
            : data.error?.fieldErrors?.newPassword?.[0] ?? "Something went wrong."
        );
        return;
      }
      setPhone(data.data.phone);
      setDevOtp(data.data.devOtp ?? null);
      setStep("confirm");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setSuccess(true);
      setStep("request");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setDevOtp(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "confirm") {
    return (
      <form onSubmit={handleConfirm} className="flex max-w-md flex-col gap-4 rounded-lg border border-[#E2E8F0] bg-white p-8">
        <h2 className="text-base font-semibold text-[#1A1A2E]">Confirm password change</h2>
        <p className="text-sm text-[#6B7280]">
          We sent a 6-digit code to {phone}. Enter it below to finish changing your password.
        </p>

        <FormField label="Confirmation code" required>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="123456"
            className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm tracking-widest outline-none focus:border-[#E4A8F3]"
          />
        </FormField>

        {devOtp && (
          <p className="rounded-md bg-[#F8FAFC] px-3 py-2 text-sm text-[#1A1A2E]">
            Dev OTP (no SMS provider configured): <strong>{devOtp}</strong>
          </p>
        )}

        {error && <p className="text-sm text-[#DC2626]">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setError(null);
            }}
            className="h-11 rounded-md border border-[#E2E8F0] px-4 text-sm font-medium text-[#1A1A2E]"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 flex-1 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Confirming…" : "Confirm Change"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequest} className="flex max-w-md flex-col gap-4 rounded-lg border border-[#E2E8F0] bg-white p-8">
      <h2 className="text-base font-semibold text-[#1A1A2E]">Change password</h2>
      <p className="text-sm text-[#6B7280]">
        For security, a confirmation code will be sent to your phone before this change takes effect.
      </p>

      <FormField label="Current password" required>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="New password" required>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Confirm new password" required>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
      {success && <p className="text-sm text-[#16A34A]">Password updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Sending code…" : "Send Confirmation Code"}
      </button>
    </form>
  );
}
