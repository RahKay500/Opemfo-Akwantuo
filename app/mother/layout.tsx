import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import MotherBottomNav from "@/components/ui/MotherBottomNav";
import EmergencyBell from "@/components/ui/EmergencyBell";

export default function MotherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#F6F1F8]">
      <SessionKeepAlive />
      {/* pb clears both the 80px MotherBottomNav and the EmergencyBell
          floating above it (bottom-24 + its own 70px) so bottom-of-page
          content like a submit button is never covered by the fixed overlays. */}
      <div className="flex-1 pb-44">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px]">
        <MotherBottomNav />
      </div>
      <EmergencyBell />
    </div>
  );
}
