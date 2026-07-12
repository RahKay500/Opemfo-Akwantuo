import Link from "next/link";
import { PartnerIcon } from "@/components/ui/icons";

export default function SharePartnerCard() {
  return (
    <Link
      href="/mother/partner"
      className="flex items-center gap-4 rounded-card bg-white p-5 text-left shadow-card"
    >
      <div className="flex size-12 items-center justify-center rounded-badge bg-pink-light">
        <PartnerIcon className="size-[22px] text-pink-deep" />
      </div>
      <div className="flex-1">
        <p className="font-heading text-[15px] font-bold text-text-primary">Share with your partner</p>
        <p className="mt-0.5 font-body text-xs text-text-secondary">Keep them involved in your journey</p>
      </div>
      <span className="font-body text-[13px] font-medium text-pink-deep">Set up →</span>
    </Link>
  );
}
