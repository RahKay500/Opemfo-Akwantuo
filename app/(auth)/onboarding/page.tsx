import Image from "next/image";
import Link from "next/link";
import OnboardingIllustration from "@/components/illustrations/OnboardingIllustration";

export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F6F1F8] px-6 pb-6 pt-11 lg:justify-center lg:bg-transparent lg:pt-0">
      {/* Shown on both breakpoints — the shared auth layout's left panel only
          repeats the logo/wordmark, not this illustration, so no duplication. */}
      <div className="flex aspect-square w-full max-w-[300px] items-center justify-center rounded-card bg-white shadow-card">
        <OnboardingIllustration className="w-[85%]" />
      </div>

      {/* Small lockup instead of the old full hero box — the illustration now
          carries the visual weight; hidden at lg since the layout's left
          panel already shows the full logo + wordmark there. */}
      <div className="mt-5 flex items-center gap-2 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-badge bg-primary">
          <Image src="/images/logo.png" alt="" width={18} height={18} />
        </div>
        <p className="font-heading text-base font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
      </div>

      <div className="flex flex-col items-center gap-3 pt-6 text-center lg:pt-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Caring for every mother</h1>
        <p className="font-body text-[15px] text-text-secondary">
          Track pregnancies, manage referrals and connect mothers, midwives/nurses and doctors — all in one
          place.
        </p>
      </div>

      <div className="flex-1 lg:hidden" />

      <Link
        href="/activate"
        className="flex h-14 w-full items-center justify-center rounded-button bg-lilac-dark font-heading text-[17px] font-bold text-white lg:mt-8"
      >
        Get Started
      </Link>
      <p className="pt-4 font-body text-[13px] text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-pink-deep">
          Sign in
        </Link>
      </p>
    </main>
  );
}
