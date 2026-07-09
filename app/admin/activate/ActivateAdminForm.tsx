"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/admin/FormField";

export default function ActivateAdminForm() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/activate/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
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

    if (password !== confirmPassword) {
      setError("Password and confirmation don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/activate/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "confirm") {
    return (
      <form onSubmit={handleConfirm} className="flex flex-col gap-4">
        <p className="text-sm text-[#6B7280]">
          We sent a 6-digit code to {phone}. Enter it below along with the password you&apos;d like to use.
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

        <FormField label="New password" required>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
          />
        </FormField>

        <FormField label="Confirm password" required>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
          />
        </FormField>

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
            {submitting ? "Activating…" : "Activate Account"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequest} className="flex flex-col gap-4">
      <FormField label="Phone number" required>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 123 4567"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Sending code…" : "Send Activation Code"}
      </button>
    </form>
  );
}
