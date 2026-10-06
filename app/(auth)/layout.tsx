import Image from "next/image";
import { CheckIcon } from "@/components/ui/icons";

const FEATURES = ["Real-time referral tracking", "Shared patient records", "Emergency alerts & escalation"];

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-1/2 shrink-0 flex-col justify-center gap-10 overflow-hidden bg-lilac-deeper px-12 py-16 lg:flex">
        {/* Same photo + purple scrim treatment as the onboarding page's left
            panel, for consistency across the whole auth flow (photo credit:
            Unsplash, free license). */}
        <Image
          src="/images/onboarding-hero.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-[68%_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-lilac-deeper/55 via-lilac-deeper/45 to-[#3a0f42]/80" />

        <div className="relative z-10 ml-[60%] w-fit text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-badge bg-white">
            <Image src="/images/logo.png" alt="" width={40} height={40} />
          </div>
          <p className="mt-5 font-heading text-2xl font-bold text-white drop-shadow-md">Ɔpemfoɔ Akwantuo</p>
        </div>
        <div className="relative z-10 ml-[60%] flex w-fit flex-col items-start gap-4">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-badge bg-white/25 backdrop-blur-sm">
                <CheckIcon className="size-3.5 text-white" />
              </span>
              <p className="font-body text-sm text-white drop-shadow-md">{f}</p>
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
