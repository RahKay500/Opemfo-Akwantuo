import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import MidwifeBottomNav from "@/components/ui/MidwifeBottomNav";
import MidwifeSidebar from "@/components/ui/MidwifeSidebar";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeSidebarData } from "@/lib/queries/midwife-sidebar";

export default async function MidwifeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const sidebarData = user ? await getMidwifeSidebarData(user.id) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1F8] lg:flex-row">
      <SessionKeepAlive />
      <MidwifeSidebar
        name={sidebarData?.name ?? user?.name ?? ""}
        facilityName={sidebarData?.facilityName ?? ""}
        activeEmergency={sidebarData?.activeEmergency ?? null}
      />
      <div className="flex flex-1 justify-center overflow-x-hidden pb-20 lg:justify-stretch lg:overflow-x-auto lg:px-[10px] lg:pb-10">
        <div className="w-full max-w-[430px] lg:max-w-none">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] lg:hidden">
        <MidwifeBottomNav />
      </div>
    </div>
  );
}
