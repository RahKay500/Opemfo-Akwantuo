import type { ReactNode } from "react";

// Application Components → Inline CTAs, "Inline CTA" component, pulled
// from the Figma design system ("gfgfg" in the Figma MCP), node
// 1255:131915 (Type=Image/Actions/Email field/Change plan/Upgrade plan/
// Payment method/Receipt). Only "Image" and "Actions" are implemented —
// title + supportingText + an actions row, with an optional leading
// cover image. The remaining types are SaaS-subscription-billing content
// (change/upgrade plan, payment method, receipt) that don't apply to
// this app, which has no billing/subscription concept.
export interface InlineCtaProps {
  title: string;
  description?: string;
  image?: string;
  actions?: ReactNode;
  className?: string;
}

export default function InlineCta({ title, description, image, actions, className }: InlineCtaProps) {
  if (image) {
    return (
      <div className={`flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="w-[239px] shrink-0 object-cover" />
        <div className="flex flex-1 flex-col gap-5 p-6">
          <div className="flex flex-col gap-0.5">
            <p className="font-heading text-md font-semibold text-gray-900">{title}</p>
            {description && <p className="font-body text-sm text-gray-600">{description}</p>}
          </div>
          {actions && <div className="flex items-start gap-3">{actions}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs ${className ?? ""}`}>
      <div className="flex flex-col gap-0.5">
        <p className="font-heading text-md font-semibold text-gray-900">{title}</p>
        {description && <p className="font-body text-sm text-gray-600">{description}</p>}
      </div>
      {actions && <div className="flex items-start gap-3">{actions}</div>}
    </div>
  );
}
