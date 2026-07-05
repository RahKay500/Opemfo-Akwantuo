"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageIcon } from "@/components/ui/icons";
import OTPInput from "@/components/ui/OTPInput";
import { maskGhanaPhone } from "@/lib/mask";

type Next = "set-password" | "reset-password" | "account-created";

function resolveNext(value: string | null): Next {
  if (value === "reset-password" || value === "account-created") return value;
  return "set-password";
}

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const next = resolveNext(searchParams.get("next"));
  // Which "resend" endpoint applies: forgot-password already sent the first
  // code for a reset, otp/send covers both mother onboarding and staff
  // registration (both leave the account inactive until verified).
  const resendEndpoint = next === "reset-password" ? "/api/auth/forgot-password" : "/api/auth/otp/send";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  // Only ever populated when no real SMS provider is configured — see
  // lib/hubtel.ts's isSmsUnconfigured(). Never present in production.
  const [devOtp, setDevOtp] = useState(searchParams.get("devOtp"));

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!phone) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white p-6 text-center">
        <p className="font-body text-sm text-text-secondary">
          Missing phone number. Go back and try again.
        </p>
        <Link href="/login" className="font-body text-sm font-medium text-pink-deep">
          Back to login
        </Link>
      </main>
    );
  }

  async function handleVerify() {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error ?? "Invalid or expired code.");
        return;
      }
      const setupToken = verifyData.setupToken as string;

      if (next === "account-created") {
        // Staff registration: password was already collected and hashed at
        // /api/auth/register, so this just proves phone ownership and
        // activates the account — no password field to send here.
        const finalizeRes = await fetch("/api/auth/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setupToken }),
        });
        const finalizeData = await finalizeRes.json();
        if (!finalizeRes.ok) {
          setError(typeof finalizeData.error === "string" ? finalizeData.error : "Something went wrong.");
          return;
        }
        router.push(`/account-created?role=${finalizeData.user.role}`);
        return;
      }

      router.push(`/${next}?token=${encodeURIComponent(setupToken)}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError(null);
    try {
      const res = await fetch(resendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setDevOtp(data.devOtp ?? null);
      setCooldown(60);
    } catch {
      setError("Couldn't resend the code. Please try again.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start bg-white pb-12 pt-11">
      <div className="flex w-full flex-col items-center pt-[100px]">
        <div className="flex size-16 items-center justify-center rounded-[32px] bg-lilac-light">
          <MessageIcon className="size-7 text-lilac-deeper" />
        </div>
        <h1 className="mt-4 font-heading text-[26px] font-bold text-text-primary">Verify your number</h1>
        <p className="mt-2 font-body text-sm text-text-secondary">We sent a 6-digit code to</p>
        <p className="font-body text-sm font-medium text-text-primary">{maskGhanaPhone(phone)}</p>
      </div>

      <div className="w-full px-6 pt-10">
        {devOtp && (
          <button
            type="button"
            onClick={() => setOtp(devOtp)}
            className="mb-4 w-full rounded-input border border-dashed border-lilac-dark bg-lilac-light px-3 py-2 text-center font-body text-sm text-lilac-deeper"
          >
            No SMS provider configured — dev code is <span className="font-bold">{devOtp}</span> (tap to fill)
          </button>
        )}

        <OTPInput value={otp} onChange={setOtp} autoFocus />
        {error && <p className="mt-3 text-center text-sm text-[#DC2626]">{error}</p>}

        <div className="flex items-center justify-center gap-2 pt-6">
          <span className="font-body text-[13px] text-text-secondary">Didn&apos;t receive it?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="font-body text-[13px] font-medium text-pink-deep disabled:text-text-secondary"
          >
            {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || otp.length !== 6}
          className="mt-10 h-14 w-full rounded-button bg-primary font-heading text-[17px] font-bold text-lilac-deeper disabled:bg-border-color disabled:text-text-secondary"
        >
          {verifying ? "Verifying…" : "Verify"}
        </button>
      </div>
    </main>
  );
}

export default function OTPPage() {
  return (
    <Suspense>
      <OTPForm />
    </Suspense>
  );
}
