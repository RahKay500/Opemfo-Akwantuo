"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

function ChecklistItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-[18px] items-center justify-center rounded-badge",
          met ? "bg-[#F0FDF4]" : "bg-[#F3F4F6]"
        )}
      >
        {met && <CheckIcon className="size-3 text-[#16A34A]" />}
      </span>
      <p className={cn("font-body text-[13px]", met ? "text-[#374151]" : "text-[#9CA3AF]")}>{label}</p>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  async function handleSubmit() {
    setError(null);
    if (!hasLength || !hasUppercase || !hasNumber) {
      setError("Password doesn't meet all requirements yet.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      const ROLE_HOME: Record<string, string> = {
        MOTHER: "/mother/dashboard",
        MIDWIFE: "/midwife/dashboard",
        DOCTOR: "/doctor/dashboard",
      };
      router.push(ROLE_HOME[data.user.role] ?? "/login");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start bg-[#F6F1F8] px-6 pb-6 pt-11 lg:bg-transparent">
      <button type="button" onClick={() => router.back()} className="flex size-10 items-center justify-center">
        <ArrowLeftIcon className="size-6 text-text-primary" />
      </button>

      <div className="flex flex-col gap-2.5 pt-5">
        <h1 className="font-heading text-[26px] font-bold leading-[34px] text-text-primary">
          Create new password
        </h1>
        <p className="font-body text-[15px] leading-[23px] text-text-secondary">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      <div className="flex w-full flex-col gap-[18px] pt-7">
        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-[#374151]">New password</label>
          <div className="flex h-14 items-center rounded-[14px] border-[1.5px] border-border-color bg-white px-4">
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 font-body text-[15px] text-text-primary outline-none"
            />
            <EyeIcon className="size-[18px] text-text-secondary" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-body text-sm font-medium text-[#374151]">Confirm password</label>
          <div className="flex h-14 items-center rounded-[14px] border-[1.5px] border-border-color bg-white px-4">
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 font-body text-[15px] text-text-primary outline-none"
            />
            <EyeIcon className="size-[18px] text-text-secondary" />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <ChecklistItem met={hasLength} label="At least 8 characters" />
          <ChecklistItem met={hasUppercase} label="One uppercase letter" />
          <ChecklistItem met={hasNumber} label="One number" />
        </div>
      </div>

      {error && <p className="pt-4 font-body text-sm text-[#DC2626]">{error}</p>}

      <div className="flex flex-1" />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !token}
        className="h-14 w-full rounded-[16px] bg-lilac-dark font-heading text-[17px] font-bold text-white disabled:opacity-60"
      >
        {submitting ? "Resetting…" : "Reset Password"}
      </button>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
