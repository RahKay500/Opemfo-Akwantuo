import Image from "next/image";
import Link from "next/link";
import OnboardingIllustration from "@/components/illustrations/OnboardingIllustration";
import OnboardingSeenMarker from "@/components/OnboardingSeenMarker";
import { CheckIcon } from "@/components/ui/icons";

const FEATURES = ["Real-time referral tracking", "Shared patient records", "Emergency alerts & escalation"];

// Back to the simple split layout: a calm purple half-panel (logo, wordmark,
// feature checklist) on desktop, illustration-led content on the other side
// — the same structure the shared auth layout's branding panel still uses
// for login/activate/etc., just inlined here since onboarding has its own
// route (for the skip-for-returning-visitors logic) rather than sharing
// that layout file.
export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <OnboardingSeenMarker />

      <div className="relative hidden w-1/2 shrink-0 flex-col justify-center gap-10 overflow-hidden bg-lilac-deeper px-12 py-16 lg:flex">
        {/* A real photo instead of an abstract gradient — a purple scrim on
            top keeps the panel reading as the same brand color and keeps
            the white text/logo legible over it, wherever the photo is
            lighter (photo credit: Unsplash, free license). */}
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

      <div className="flex flex-1 flex-col items-center bg-[#F6F1F8] px-6 pb-6 pt-11 lg:w-1/2 lg:shrink-0 lg:justify-center lg:bg-white lg:px-10 lg:pt-0">
        <div className="flex aspect-square w-full max-w-[360px] items-center justify-center rounded-card bg-white shadow-card">
          <OnboardingIllustration className="w-[85%]" />
        </div>

        <div className="mt-5 flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-badge bg-primary">
            <Image src="/images/logo.png" alt="" width={18} height={18} />
          </div>
          <p className="font-heading text-base font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
        </div>

        <div className="flex max-w-sm flex-col items-center gap-3 pt-6 text-center lg:pt-8">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Caring for every mother</h1>
          <p className="font-body text-[15px] text-text-secondary">
            Track pregnancies, manage referrals and connect mothers, midwives/nurses and doctors — all in one
            place.
          </p>
        </div>

        <div className="flex-1 lg:hidden" />

        <Link
          href="/activate"
          className="flex h-14 w-full max-w-xs items-center justify-center rounded-button bg-lilac-dark font-heading text-[17px] font-bold text-white lg:mt-8"
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
