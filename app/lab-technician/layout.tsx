import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import LabTechnicianBottomNav from "@/components/ui/LabTechnicianBottomNav";
import LabTechnicianSidebar from "@/components/ui/LabTechnicianSidebar";
import { getCurrentUser } from "@/lib/current-user";
import { getLabTechnicianSidebarData } from "@/lib/queries/lab-technician-sidebar";

export default async function LabTechnicianLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const sidebarData = user ? await getLabTechnicianSidebarData(user.id) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1F8] lg:flex-row">
      <SessionKeepAlive />
      <LabTechnicianSidebar pendingCount={sidebarData?.pendingCount ?? 0} />
      <div className="flex flex-1 justify-center overflow-x-hidden pb-20 lg:justify-stretch lg:overflow-x-auto lg:pb-10">
        <div className="w-full max-w-[430px] lg:max-w-none">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] lg:hidden">
        <LabTechnicianBottomNav />
      </div>
    </div>
  );
}
