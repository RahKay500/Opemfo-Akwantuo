import Image from "next/image";
import Link from "next/link";
import OnboardingIllustration from "@/components/illustrations/OnboardingIllustration";
import OnboardingSeenMarker from "@/components/OnboardingSeenMarker";
import { CheckIcon } from "@/components/ui/icons";

const FEATURES = ["Real-time referral tracking", "Shared patient records", "Emergency alerts & escalation"];

// A real mesh gradient — several radial blooms of different brand hues,
// each fading to transparent over a deep base color — instead of a single
// linear ramp. Stacking soft-edged radial gradients this way is the
// standard CSS technique for a mesh/aurora look with no canvas or plugin.
const MESH_GRADIENT_STYLE = {
  backgroundColor: "#5c1367",
  backgroundImage: [
    "radial-gradient(at 12% 20%, #c341db 0%, transparent 55%)",
    "radial-gradient(at 88% 14%, #ee46bc 0%, transparent 50%)",
    "radial-gradient(at 80% 90%, #c11574 0%, transparent 55%)",
    "radial-gradient(at 14% 92%, #eeaafd 0%, transparent 42%)",
    "radial-gradient(at 55% 46%, #9f1ab1 0%, transparent 65%)",
  ].join(", "),
};

// Mobile keeps the illustration-led layout (it already works well there).
// Desktop moves to its own editorial hero — a dark panel carrying a big
// headline, body copy and small decorative accents, with the CTA on a
// plain white panel — the same structure/mood as calmer reference login
// pages (e.g. Cisco NetAcad's), not the old flat-color box + centered text.
export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <OnboardingSeenMarker />
      {/* Desktop: dark hero panel — hidden on mobile. A real mesh gradient
          (several radial color blooms, not a single linear ramp) carries
          the base tone, layered with soft blur blooms for extra depth and
          a small scattered constellation of shapes — the same "dark
          editorial panel with drifting confetti" language as the Cisco
          reference, built from our own brand ramp. */}
      <div
        className="relative hidden w-1/2 shrink-0 flex-col justify-center overflow-hidden px-16 py-16 lg:flex"
        style={MESH_GRADIENT_STYLE}
      >
        {/* Color blooms — four, varied in hue/size/blur, the two largest
            drifting slowly (aurora-blob-*), so the gradient reads as lit
            from within and gently alive rather than a static tint. */}
        <div className="aurora-blob-a pointer-events-none absolute -left-28 -top-28 size-[26rem] rounded-full bg-primary opacity-25 blur-3xl" />
        <div className="aurora-blob-b pointer-events-none absolute -bottom-36 -right-20 size-[32rem] rounded-full bg-pink-accent opacity-25 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 size-72 rounded-full bg-lilac-mid opacity-20 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 top-8 size-64 rounded-full bg-pink-deep opacity-20 blur-3xl" />

        {/* Fractal-noise grain — a textured finish over the gradient instead
            of a flat digital fill. */}
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" />

        {/* Decorative constellation — a full-panel scatter with real scale
            hierarchy (one big bleeding ring, several mid rings, a field of
            small filled/outline/rotated shapes) rather than a handful of
            uniform dots, so the panel reads as composed rather than sparse. */}
        {/* One large shape for scale contrast against the small confetti. */}
        <div className="pointer-events-none absolute -right-14 -top-14 size-44 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-10 size-48 rounded-full border border-pink-accent/15" />

        {/* Organic blob shapes — irregular border-radius instead of a perfect
            circle, for the softer, hand-drawn accent that a field of pure
            circles/rings can't give on its own. */}
        <div className="pointer-events-none absolute right-20 top-40 size-16 rounded-[63%_37%_54%_46%/43%_37%_63%_57%] bg-pink-accent/15" />
        <div className="pointer-events-none absolute bottom-32 left-48 size-12 rounded-[38%_62%_57%_43%/47%_41%_59%_53%] bg-lilac-mid/20" />

        {/* Frosted-glass "porthole" shapes — real glassmorphism (blurred
            backdrop + hairline border) rather than a flat tint, catching
            the gradient behind them like glass would. */}
        <div className="pointer-events-none absolute right-48 top-52 size-11 rounded-full border border-white/25 bg-white/10 backdrop-blur-md" />
        <div className="pointer-events-none absolute bottom-40 left-8 size-16 rounded-full border border-white/20 bg-white/10 backdrop-blur-md" />

        {/* Top band, spanning the full width above the headline. */}
        <div className="pointer-events-none absolute right-24 top-14 size-9 rounded-full border-2 border-white/25" />
        <div className="pointer-events-none absolute right-10 top-28 size-3 rounded-full bg-pink-accent" />
        <div className="pointer-events-none absolute right-44 top-10 size-2 rounded-full bg-white/50" />
        <div className="pointer-events-none absolute right-60 top-6 size-5 rounded-full border-2 border-pink-accent/60" />
        <div className="pointer-events-none absolute right-52 top-2 size-14 rounded-full border border-pink-accent/20" />
        <div className="pointer-events-none absolute right-96 top-2 size-2 rotate-45 rounded-[3px] bg-white/25" />
        <div className="pointer-events-none absolute right-72 top-32 size-2.5 rounded-full bg-lilac-mid/70" />

        {/* Right column, running down the empty margin beside the copy. */}
        <div className="pointer-events-none absolute right-8 top-64 size-16 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute right-16 top-48 size-4 rotate-12 rounded-lg bg-lilac-mid/80" />
        <div className="pointer-events-none absolute right-14 top-72 size-3 rounded-full bg-lilac-mid/60" />
        <div className="pointer-events-none absolute right-4 top-[22rem] size-3 rotate-45 rounded-[3px] bg-white/25" />
        <div className="pointer-events-none absolute right-28 top-[19rem] size-1.5 rounded-full bg-pink-deep/70" />
        <div className="pointer-events-none absolute right-20 top-[26rem] size-6 rounded-full border-2 border-pink-accent/50" />
        <div className="pointer-events-none absolute right-40 top-60 size-1.5 rounded-full bg-pink-deep/80" />

        {/* Bottom band, below the feature list. */}
        <div className="pointer-events-none absolute bottom-8 left-24 size-24 rounded-full border border-pink-accent/15" />
        <div className="pointer-events-none absolute bottom-16 left-64 size-2 rounded-full bg-white/40" />
        <div className="pointer-events-none absolute bottom-24 left-96 size-8 rounded-full border-2 border-lilac-mid/30" />
        <div className="pointer-events-none absolute bottom-12 left-[30rem] size-3 rotate-45 rounded-[3px] bg-pink-deep/40" />
        <div className="pointer-events-none absolute bottom-6 right-16 size-2.5 rounded-full bg-pink-accent/60" />

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
              <span className="flex size-6 shrink-0 items-center justify-center rounded-badge border border-white/20 bg-white/10 backdrop-blur-md">
                <CheckIcon className="size-3.5 text-white" />
              </span>
              <p className="font-body text-sm text-white/90">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: CTA panel — a faint radial wash plus the brand's own care
          illustration and a few pale shape accents, so it carries real
          content instead of reading as a void next to the gradient panel. */}
      <div className="relative hidden w-1/2 shrink-0 flex-col items-center justify-center gap-10 overflow-hidden bg-[radial-gradient(ellipse_at_center,#ffffff_55%,#fdf4ff_100%)] lg:flex">
        <div className="pointer-events-none absolute left-10 top-16 size-16 rounded-full border border-lilac-mid/30" />
        <div className="pointer-events-none absolute right-16 top-24 size-2.5 rounded-full bg-pink-accent/40" />
        <div className="pointer-events-none absolute left-20 top-1/2 size-3 rotate-45 rounded-[3px] bg-lilac-mid/40" />
        <div className="pointer-events-none absolute bottom-24 right-14 size-20 rounded-full border border-pink-accent/20" />
        <div className="pointer-events-none absolute bottom-16 left-16 size-2 rounded-full bg-primary/30" />
        <div className="pointer-events-none absolute right-24 top-1/2 size-10 rounded-[58%_42%_39%_61%/52%_36%_64%_48%] bg-pink-accent/10" />
        <div className="pointer-events-none absolute bottom-40 left-32 size-8 rounded-[41%_59%_63%_37%/48%_55%_45%_52%] bg-lilac-mid/15" />

        {/* Illustration sits in its own frosted-glass card — the "elevated
            card container" a hero visual gets on richer reference login
            pages, instead of floating loose on the panel. */}
        <div className="relative flex items-center justify-center rounded-[32px] border border-white/70 bg-white/50 p-10 shadow-[0_24px_60px_-24px_rgba(130,24,144,0.28)] backdrop-blur-xl">
          <div className="pointer-events-none absolute size-72 rounded-full bg-lilac-mid/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-pink-accent/15 blur-2xl" />
          <OnboardingIllustration className="relative w-56" idPrefix="desktop-" />
        </div>

        <div className="relative flex w-full max-w-xs flex-col items-center">
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

      {/* Mobile: the same mesh-gradient hero as desktop — illustration-led,
          just stacked vertically instead of split into two panels. */}
      <div
        className="relative flex flex-1 flex-col items-center overflow-hidden px-6 pb-6 pt-11 lg:hidden"
        style={MESH_GRADIENT_STYLE}
      >
        <div className="aurora-blob-a pointer-events-none absolute -left-16 -top-12 size-64 rounded-full bg-primary opacity-25 blur-3xl" />
        <div className="aurora-blob-b pointer-events-none absolute -bottom-20 -right-14 size-72 rounded-full bg-pink-accent opacity-25 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 size-40 rounded-full bg-lilac-mid opacity-20 blur-2xl" />
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay" />

        <div className="pointer-events-none absolute -right-10 -top-6 size-32 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 size-36 rounded-full border border-pink-accent/15" />
        <div className="pointer-events-none absolute right-8 top-2 size-2 rounded-full bg-pink-accent" />
        <div className="pointer-events-none absolute right-16 top-8 size-5 rounded-full border-2 border-white/25" />
        <div className="pointer-events-none absolute bottom-24 right-8 size-2.5 rotate-45 rounded-[3px] bg-white/25" />
        <div className="pointer-events-none absolute bottom-32 left-4 size-9 rounded-full border border-white/20 bg-white/10 backdrop-blur-md" />
        <div className="pointer-events-none absolute bottom-16 right-10 size-8 rounded-[58%_42%_39%_61%/52%_36%_64%_48%] bg-lilac-mid/15" />

        <div className="relative z-10 flex aspect-square w-full max-w-[360px] items-center justify-center rounded-card border border-white/60 bg-white/60 shadow-[0_24px_60px_-24px_rgba(130,24,144,0.35)] backdrop-blur-xl">
          <OnboardingIllustration className="w-[85%]" idPrefix="mobile-" />
        </div>

        <div className="relative z-10 mt-5 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-badge bg-white">
            <Image src="/images/logo.png" alt="" width={18} height={18} />
          </div>
          <p className="font-heading text-base font-bold text-white">Ɔpemfoɔ Akwantuo</p>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3 pt-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-white">Caring for every mother</h1>
          <p className="font-body text-[15px] text-white/80">
            Track pregnancies, manage referrals and connect mothers, midwives/nurses and doctors — all in one
            place.
          </p>
        </div>

        <div className="flex-1" />

        <Link
          href="/activate"
          className="relative z-10 flex h-14 w-full items-center justify-center rounded-button bg-white font-heading text-[17px] font-bold text-lilac-dark"
        >
          Get Started
        </Link>
        <p className="relative z-10 pt-4 font-body text-[13px] text-white/80">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white underline decoration-white/40 underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
