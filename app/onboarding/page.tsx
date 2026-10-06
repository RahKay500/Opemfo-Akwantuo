import Image from "next/image";
import Link from "next/link";
import OnboardingSeenMarker from "@/components/OnboardingSeenMarker";
import { ArrowRightIcon, CheckIcon, MidwifeIcon, PersonIcon, ShieldCheckIcon } from "@/components/ui/icons";

const FEATURES = [
  "See every test result in one place",
  "Midwives and gynaecologists share one record",
  "Track visits and your next appointment",
];

export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <OnboardingSeenMarker />

      <div className="relative hidden w-1/2 shrink-0 flex-col justify-center gap-10 overflow-hidden bg-lilac-deeper px-12 py-16 lg:flex">
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
              <p className="font-body text-base font-medium text-white drop-shadow-md">{f}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center bg-[#F6F1F8] px-6 pb-8 pt-0 lg:w-1/2 lg:shrink-0 lg:justify-center lg:bg-white lg:px-10 lg:pt-0">
        <div className="relative -mx-6 mb-8 flex h-56 items-end self-stretch overflow-hidden bg-lilac-deeper px-6 pb-5 lg:hidden">
          <Image
            src="/images/onboarding-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lilac-deeper/55 via-lilac-deeper/45 to-[#3a0f42]/80" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-badge bg-white">
              <Image src="/images/logo.png" alt="" width={24} height={24} />
            </div>
            <p className="font-heading text-xl font-bold text-white drop-shadow-md">Ɔpemfoɔ Akwantuo</p>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-bold text-text-primary">Who are you?</h1>
            <p className="font-body text-[15px] text-text-secondary">
              Choose the option that fits you and we&apos;ll take you to the right place.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <RoleOption
              href="/activate"
              icon={<PersonIcon className="size-5 text-lilac-dark" />}
              title="I'm a mother or partner"
              description="Your midwife registers you first. Then enter your phone number to get your activation code."
            />
            <RoleOption
              href="/login"
              icon={<MidwifeIcon className="size-5 text-lilac-dark" />}
              title="I work at a health facility"
              description="Midwife, gynaecologist or lab technician. Your administrator sends an activation link. Open it to create your password."
            />
          </div>

          <div className="flex items-start gap-3 rounded-card bg-white p-4 border border-border-color">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-lilac-dark" />
            <p className="font-body text-[13px] leading-5 text-text-secondary">
              Your health record is private. Health staff access it to care for you, and you choose what your
              partner can see.
            </p>
          </div>

          <p className="text-center font-body text-[13px] text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-pink-deep">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function RoleOption({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-card bg-white p-4 border border-border-color transition-colors hover:border-lilac-dark"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-badge bg-lilac-light">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-heading text-[16px] font-bold text-text-primary">{title}</span>
        <span className="font-body text-[13px] leading-5 text-text-secondary">{description}</span>
      </span>
      <ArrowRightIcon className="size-4 shrink-0 text-text-secondary" />
    </Link>
  );
}
