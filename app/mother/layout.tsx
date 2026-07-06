import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import BottomNav, { type BottomNavItem } from "@/components/ui/BottomNav";
import EmergencyBell from "@/components/ui/EmergencyBell";

const NAV_ITEMS: BottomNavItem[] = [
  { href: "/mother/dashboard", label: "Home", icon: "home" },
  { href: "/mother/records", label: "Records", icon: "records" },
  { href: "/mother/referral", label: "Referral", icon: "referral" },
  { href: "/mother/notifications", label: "Alerts", icon: "alerts" },
  { href: "/mother/profile", label: "Profile", icon: "profile" },
];

export default function MotherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#F6F1F8]">
      <SessionKeepAlive />
      {/* pb clears both the 80px BottomNav and the EmergencyBell floating
          above it (bottom-24 + its own 70px) so bottom-of-page content like
          a submit button is never covered by the fixed overlays. */}
      <div className="flex-1 pb-44">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px]">
        <BottomNav items={NAV_ITEMS} />
      </div>
      <EmergencyBell />
    </div>
  );
}
