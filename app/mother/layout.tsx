import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import MotherBottomNav from "@/components/ui/MotherBottomNav";
import MotherSidebar from "@/components/ui/MotherSidebar";
import EmergencyBell from "@/components/ui/EmergencyBell";

export default function MotherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1F8] lg:flex-row">
      <SessionKeepAlive />
      <div className="hidden lg:block">
        <MotherSidebar />
      </div>
      {/* pb clears both the 80px MotherBottomNav and the EmergencyBell
          floating above it (bottom-24 + its own 70px) so bottom-of-page
          content like a submit button is never covered by the fixed overlays.
          Both disappear at lg:, where the sidebar takes over instead. */}
      <div className="flex flex-1 justify-center overflow-x-hidden pb-44 lg:overflow-x-auto lg:pb-10">
        <div className="w-full max-w-[430px] lg:max-w-3xl">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] lg:hidden">
        <MotherBottomNav />
      </div>
      <EmergencyBell />
    </div>
  );
}
