import { initials } from "@/lib/utils";

// Base Components → Avatars, "Avatar" component, pulled from the Figma
// design system ("gfgfg" in the Figma MCP), node 18:1350 (Size=xs/sm/md/
// lg/xl/2xl, Placeholder=True/False, Text=True/False, Status icon=False/
// Online indicator). Circular, radius-full; photo variant gets a subtle
// 0.5px border, initials-placeholder variant gets bg-gray-100/border-
// gray-200 by default (overridable via `background`, since this app
// colors avatars by role/tier rather than always neutral gray) with
// centered semibold initials. Online indicator = a small white-ringed
// success-colored dot, bottom-right, sized proportionally.
// "Company" and "Verified" status icons aren't implemented — no
// organization-badge or verification-checkmark concept in this app.
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  online?: boolean;
  background?: string;
  textColor?: string;
  className?: string;
}

const SIZE_PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 56, "2xl": 64 };
const TEXT_SIZE: Record<AvatarSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-xl",
};
const DOT_SIZE: Record<AvatarSize, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
  "2xl": "size-4",
};

export default function Avatar({
  name,
  src,
  size = "md",
  online,
  background = "#F5F5F5",
  textColor = "#717680",
  className,
}: AvatarProps) {
  const px = SIZE_PX[size];
  return (
    <span className={`relative inline-flex shrink-0 ${className ?? ""}`} style={{ width: px, height: px }}>
      {src ? (
        // Generic primitive: avatar photos may come from any remote host,
        // so a plain <img> avoids needing every future source
        // pre-configured in next.config.js's image remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={px}
          height={px}
          className="size-full rounded-full border-[0.5px] border-black/10 object-cover"
        />
      ) : (
        <span
          className={`flex size-full items-center justify-center rounded-full border border-gray-200 font-heading font-semibold ${TEXT_SIZE[size]}`}
          style={{ backgroundColor: background, color: textColor }}
        >
          {initials(name)}
        </span>
      )}
      {online && (
        <span
          className={`absolute -bottom-px -right-px rounded-full border-[1.5px] border-white bg-success-500 ${DOT_SIZE[size]}`}
        />
      )}
    </span>
  );
}
