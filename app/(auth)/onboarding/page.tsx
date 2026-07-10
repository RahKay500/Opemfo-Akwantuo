import Link from "next/link";
import { HeartIcon } from "@/components/ui/icons";

export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F6F1F8] px-6 pb-6 pt-11">
      <div className="flex h-[360px] w-full flex-col items-center justify-center gap-4 rounded-card bg-primary">
        <div className="flex size-24 items-center justify-center rounded-[32px] bg-white">
          <HeartIcon className="size-10 text-primary" />
        </div>
        <p className="font-heading text-[32px] font-bold tracking-[-0.5px] text-white">
          Ɔpemfoɔ Akwantuo
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pt-9 text-center">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Caring for every mother</h1>
        <p className="font-body text-[15px] text-text-secondary">
          Track pregnancies, manage referrals and connect mothers, midwives and doctors — all in one
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
    </main>
  );
}
