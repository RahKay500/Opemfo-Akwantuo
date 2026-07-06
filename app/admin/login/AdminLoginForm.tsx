"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Invalid credentials.");
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
        <label className="text-sm font-medium text-[#1A1A2E]">Phone number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 123 4567"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1A1A2E]">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="h-11 rounded-md border border-[#E2E8F0] px-3.5 text-sm text-[#1A1A2E] outline-none focus:border-[#E4A8F3]"
        />
      </div>

      {error && (
        <p className="rounded-md bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <Link href="/admin/recover" className="text-center text-sm text-[#6B7280] hover:text-[#1A1A2E]">
        Trouble signing in?
      </Link>
    </form>
  );
}
