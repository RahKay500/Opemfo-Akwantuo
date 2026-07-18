import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import { getAdminSession, getCurrentAdminIdentity } from "@/lib/current-admin";

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const identity = await getCurrentAdminIdentity();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-body text-[#1A1A2E] lg:flex-row">
      <Sidebar
        facilityId={session.facilityId}
        admin={{
          name: identity?.name ?? null,
          orgName: identity?.orgName ?? null,
          district: identity?.district ?? null,
          region: identity?.region ?? null,
        }}
      />
      <div className="flex-1 overflow-x-hidden pb-16 lg:overflow-x-auto lg:pb-0">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <AdminBottomNav facilityId={session.facilityId} />
      </div>
    </div>
  );
}
