import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import DoctorBottomNav from "@/components/ui/DoctorBottomNav";
import DoctorSidebar from "@/components/ui/DoctorSidebar";
import IdentityMenu from "@/components/ui/IdentityMenu";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorSidebarData } from "@/lib/queries/doctor-sidebar";

export default async function DoctorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const sidebarData = user ? await getDoctorSidebarData(user.id) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1F8] lg:flex-row">
      <SessionKeepAlive />
      <DoctorSidebar
        facilityType={sidebarData?.facilityType ?? null}
        newSharedRecordsCount={sidebarData?.newSharedRecordsCount ?? 0}
      />
      <div className="flex flex-1 justify-center overflow-x-hidden pb-20 lg:flex-col lg:justify-stretch lg:overflow-x-auto lg:pb-10">
        <div className="hidden justify-end px-8 pt-6 lg:flex">
          <IdentityMenu
            name={sidebarData?.name ?? user?.name ?? ""}
            subtitle={sidebarData?.facilityName ? `${sidebarData.facilityName} · Doctor` : null}
            profileHref="/doctor/profile"
          />
        </div>
        <div className="w-full max-w-[430px] lg:max-w-none">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] lg:hidden">
        <DoctorBottomNav />
      </div>
    </div>
  );
}
