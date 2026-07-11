"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon } from "@/components/ui/icons";
import { setLastRole } from "@/lib/last-role";

const ROLE_HOME: Record<string, string> = {
  MOTHER: "/mother/dashboard",
  MIDWIFE: "/midwife/dashboard",
  DOCTOR: "/doctor/dashboard",
};

function AccountCreatedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? "";

  useEffect(() => {
    setLastRole(role);
  }, [role]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F6F1F8] px-6 pb-6 pt-11 lg:bg-transparent">
      <div className="flex-1" />
      <div className="flex size-[120px] items-center justify-center rounded-badge bg-[#F0FDF4]">
        <div className="flex size-20 items-center justify-center rounded-badge bg-[#16A34A]">
          <CheckIcon className="size-[34px] text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pt-7 text-center">
        <h1 className="font-heading text-[26px] font-bold text-text-primary">Account created!</h1>
        <p className="font-body text-[15px] leading-[23px] text-text-secondary">
          Your Ɔpimfuo account is ready. Let us set up your profile and start caring for mothers.
        </p>
      </div>

      <div className="flex-1" />
      <button
        type="button"
        onClick={() => router.push(ROLE_HOME[role] ?? "/login")}
        className="h-14 w-full rounded-[16px] bg-lilac-dark font-heading text-[17px] font-bold text-white"
      >
        Continue to Dashboard
      </button>
    </main>
  );
}

export default function AccountCreatedPage() {
  return (
    <Suspense>
      <AccountCreatedContent />
    </Suspense>
  );
}
