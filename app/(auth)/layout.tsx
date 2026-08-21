import Image from "next/image";
import { CheckIcon } from "@/components/ui/icons";

const FEATURES = ["Real-time referral tracking", "Shared patient records", "Emergency alerts & escalation"];

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-1/2 shrink-0 flex-col justify-center gap-10 overflow-hidden bg-lilac-deeper px-12 py-16 lg:flex">
        {/* Ambient glow instead of a flat saturated fill — a solid bg-primary
            block read as harsh; two soft blurred circles on a deeper base
            keep the same brand hues but calmer, like a dusk sky. */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-[28rem] rounded-full bg-pink-accent opacity-20 blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-badge bg-white">
            <Image src="/images/logo.png" alt="" width={40} height={40} />
          </div>
          <p className="mt-5 font-heading text-2xl font-bold text-white">Ɔpemfoɔ Akwantuo</p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
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
