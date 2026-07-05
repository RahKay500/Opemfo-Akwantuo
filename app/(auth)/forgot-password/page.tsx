"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, LockIcon } from "@/components/ui/icons";
import { normalizeGhanaPhone } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    const normalized = normalizeGhanaPhone(phone);
    if (!normalized) {
      setError("Enter a valid Ghana phone number, e.g. 024 123 4567.");
      return;
    }

    setSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });
      router.push(`/otp?phone=${encodeURIComponent(normalized)}&next=reset-password`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start bg-[#F6F1F8] px-6 pb-6 pt-11">
      <button type="button" onClick={() => router.back()} className="flex size-10 items-center justify-center">
        <ArrowLeftIcon className="size-6 text-text-primary" />
      </button>

      <div className="flex flex-col items-start pt-6">
        <div className="flex size-16 items-center justify-center rounded-[28px] bg-lilac-light">
          <LockIcon className="size-7 text-lilac-deeper" />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-5">
        <h1 className="font-heading text-[26px] font-bold leading-[34px] text-text-primary">
          Forgot password?
        </h1>
        <p className="font-body text-[15px] leading-[23px] text-text-secondary">
          Enter your registered phone number and we will send you a reset code.
        </p>
      </div>

      <div className="w-full pt-7">
        <label className="mb-2 block font-body text-sm font-medium text-[#374151]">Phone number</label>
        <input
          type="tel"
          placeholder="024 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-14 w-full rounded-[14px] border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </div>

      {error && <p className="pt-3 font-body text-sm text-[#DC2626]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-2 h-14 w-full rounded-[16px] bg-lilac-dark font-heading text-[17px] font-bold text-white disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send Reset Code"}
      </button>

      <div className="flex flex-1" />
      <p className="flex w-full justify-center gap-1 pb-2 font-body text-[13px]">
        <span className="text-text-secondary">Remember it?</span>
        <Link href="/login" className="font-semibold text-pink-deep">
          Sign in
        </Link>
      </p>
    </main>
  );
}
