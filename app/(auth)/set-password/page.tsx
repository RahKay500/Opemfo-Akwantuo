"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import PasswordStrength from "@/components/ui/PasswordStrength";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must be 8+ characters with an uppercase letter and a number.");
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
      router.push(`/account-created?role=${data.user.role}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start bg-white pb-12 pt-11">
      <div className="flex w-full flex-col items-center pt-20">
        <div className="flex size-16 items-center justify-center rounded-[32px] bg-lilac-light">
          <LockIcon className="size-7 text-lilac-deeper" />
        </div>
        <h1 className="mt-4 font-heading text-[26px] font-bold text-text-primary">Create your password</h1>
        <p className="mt-1 font-body text-sm text-text-secondary">You&apos;ll use this to sign in to Ɔpimfuo</p>
      </div>

      <div className="w-full px-6 pt-10">
        <label className="mb-1.5 block font-body text-[13px] font-medium text-text-secondary">
          New password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] pr-12 font-body text-[15px] text-text-primary outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
          </button>
        </div>
        <PasswordStrength password={password} />

        {error && <p className="mt-4 text-sm text-[#DC2626]">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !token}
          className="mt-6 h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-white disabled:opacity-60"
        >
          {submitting ? "Setting password…" : "Set Password"}
        </button>
        <p className="mt-3 text-center font-body text-xs text-text-secondary">
          Remember this password — you&apos;ll need it every time you sign in.
        </p>
      </div>
    </main>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  );
}
