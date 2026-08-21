import Image from "next/image";
import Link from "next/link";
import OnboardingIllustration from "@/components/illustrations/OnboardingIllustration";
import OnboardingSeenMarker from "@/components/OnboardingSeenMarker";
import { CheckIcon } from "@/components/ui/icons";

const FEATURES = ["Real-time referral tracking", "Shared patient records", "Emergency alerts & escalation"];

// Mobile keeps the illustration-led layout (it already works well there).
// Desktop moves to its own editorial hero — a dark panel carrying a big
// headline, body copy and small decorative accents, with the CTA on a
// plain white panel — the same structure/mood as calmer reference login
// pages (e.g. Cisco NetAcad's), not the old flat-color box + centered text.
export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <OnboardingSeenMarker />
      {/* Desktop: dark hero panel — hidden on mobile. */}
      <div className="relative hidden w-1/2 shrink-0 flex-col justify-center overflow-hidden bg-lilac-deeper px-16 py-16 lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-[28rem] rounded-full bg-pink-accent opacity-20 blur-3xl" />

        <div className="pointer-events-none absolute left-56 top-16 size-3 rounded-full bg-pink-accent" />
        <div className="pointer-events-none absolute left-72 top-12 size-2 rounded-full bg-white/50" />
        <div className="pointer-events-none absolute left-52 top-40 size-4 rotate-12 rounded-lg bg-lilac-mid/80" />
        <div className="pointer-events-none absolute left-80 top-24 size-5 rounded-full border-2 border-pink-accent/70" />

        {/* Pinned to the panel's top-left, independent of the vertically
            centered headline block below it — matches how a reference
            login page like Cisco NetAcad's anchors its logo separately
            from the centered hero text. */}
        <div className="absolute left-16 top-14 z-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-badge bg-white">
            <Image src="/images/logo.png" alt="" width={26} height={26} />
          </div>
          <p className="font-heading text-lg font-bold text-white">Ɔpemfoɔ Akwantuo</p>
        </div>

        <h1 className="relative z-10 max-w-md text-balance font-heading text-5xl font-bold leading-[1.1] text-white">
          Caring for every mother
        </h1>
        <p className="relative z-10 mt-5 max-w-sm font-body text-base text-white/80">
          Track pregnancies, manage referrals and connect mothers, midwives/nurses and doctors — all in one
          place.
        </p>

        <div className="relative z-10 mt-10 flex flex-col gap-3.5">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-badge bg-white/15">
                <CheckIcon className="size-3.5 text-white" />
              </span>
              <p className="font-body text-sm text-white/90">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: plain white CTA panel. */}
      <div className="hidden w-1/2 shrink-0 items-center justify-center lg:flex">
        <div className="flex w-full max-w-xs flex-col items-center">
          <Link
            href="/activate"
            className="flex h-14 w-full items-center justify-center rounded-button bg-lilac-dark font-heading text-[17px] font-bold text-white"
          >
            Get Started
          </Link>
          <p className="pt-4 font-body text-[13px] text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-pink-deep">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Mobile: unchanged illustration-led layout. */}
      <div className="flex flex-1 flex-col items-center bg-[#F6F1F8] px-6 pb-6 pt-11 lg:hidden">
        <div className="flex aspect-square w-full max-w-[360px] items-center justify-center rounded-card bg-white shadow-card">
          <OnboardingIllustration className="w-[85%]" />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-badge bg-primary">
            <Image src="/images/logo.png" alt="" width={18} height={18} />
          </div>
          <p className="font-heading text-base font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
        </div>

        <div className="flex flex-col items-center gap-3 pt-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Caring for every mother</h1>
          <p className="font-body text-[15px] text-text-secondary">
            Track pregnancies, manage referrals and connect mothers, midwives/nurses and doctors — all in one
            place.
          </p>
        </div>

        <div className="flex-1" />

        <Link
          href="/activate"
          className="flex h-14 w-full items-center justify-center rounded-button bg-lilac-dark font-heading text-[17px] font-bold text-white"
        >
          Get Started
        </Link>
        <p className="pt-4 font-body text-[13px] text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-pink-deep">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
