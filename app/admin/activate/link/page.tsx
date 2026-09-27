"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import PasswordStrength from "@/components/ui/PasswordStrength";

function ActivateLinkForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must be 8+ characters with an uppercase letter and a number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/activate/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "This activation link is invalid or has expired.");
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Create a password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="h-11 w-full rounded-md border border-[#E2E8F0] px-3.5 pr-10 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Confirm password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>

      {error && <p className="rounded-md bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !token}
        className="mt-1 h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Setting password…" : "Set password & sign in"}
      </button>
    </form>
  );
}

export default function ActivateLinkPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] px-4 font-body">
      <div className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-medium text-[#6B7280]">Ɔpemfoɔ Akwantuo</p>
        <h1 className="mt-1 text-center text-xl font-semibold text-[#1A1A2E]">Activate your account</h1>
        <div className="mt-6">
          <Suspense>
            <ActivateLinkForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
