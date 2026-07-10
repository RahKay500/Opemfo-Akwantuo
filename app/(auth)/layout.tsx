"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { CheckIcon } from "@/components/ui/icons";

const FEATURES = ["Real-time referral tracking", "Shared patient records", "Emergency alerts & escalation"];

// Onboarding already has its own single-panel branding treatment (a
// bg-primary hero card with the same icon/wordmark) — wrapping it in this
// split-panel shell too would show the brand twice.
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  if (pathname === "/onboarding") {
    return <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden w-[420px] shrink-0 flex-col justify-center gap-10 bg-primary px-12 py-16 lg:flex">
        <div>
          <div className="flex size-14 items-center justify-center rounded-badge bg-white">
            <Image src="/images/logo.png" alt="" width={32} height={32} />
          </div>
          <p className="mt-5 font-heading text-2xl font-bold text-white">Ɔpemfoɔ Akwantuo</p>
          <p className="mt-2 font-body text-sm text-white/90">
            Connecting CHPS compounds to district hospitals for safer maternal care
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-badge bg-white/20">
                <CheckIcon className="size-3.5 text-white" />
              </span>
              <p className="font-body text-sm text-white">{f}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-y-auto py-10 lg:items-center">
        <div className="w-full max-w-[430px]">{children}</div>
      </div>
    </div>
  );
}
