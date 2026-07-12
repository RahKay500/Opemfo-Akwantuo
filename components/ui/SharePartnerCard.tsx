import Link from "next/link";
import { PartnerIcon } from "@/components/ui/icons";

export default function SharePartnerCard() {
  return (
    <div className="rounded-card bg-pink-light p-5">
      <div className="flex items-center gap-2">
        <PartnerIcon className="size-5 text-pink-deep" />
        <h2 className="font-heading text-[15px] font-bold text-pink-deep">Share with partner</h2>
      </div>
      <p className="mt-1.5 font-body text-[13px] text-pink-deep/80">
        Keep your partner informed about your pregnancy journey.
      </p>
      <Link
        href="/mother/partner"
        className="mt-4 flex h-11 w-full items-center justify-center rounded-input bg-pink-deep font-heading text-sm font-bold text-white"
      >
        Set up →
      </Link>
    </div>
  );
}
