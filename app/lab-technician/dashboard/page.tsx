import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getLabRequestQueue } from "@/lib/queries/lab-request-queue";
import { getLabTechnicianSidebarData } from "@/lib/queries/lab-technician-sidebar";
import IdentityMenu from "@/components/ui/IdentityMenu";
import LabQueueClient from "./LabQueueClient";

export default async function LabTechnicianDashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const [requests, sidebarData] = await Promise.all([
    getLabRequestQueue(user.facilityId),
    getLabTechnicianSidebarData(user.id),
  ]);

  const pendingCount = requests.filter((r) => r.status === "REQUESTED").length;
  const inProgressCount = requests.filter((r) => r.status === "IN_PROGRESS").length;
  const today = new Date().toDateString();
  const completedTodayCount = requests.filter(
    (r) => r.status === "READY" && new Date(r.requestedAt).toDateString() === today
  ).length;

  return (
    <main className="flex flex-col">
      <div className="flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-heading text-[22px] font-bold text-white">Lab Requests</p>
        <p className="mt-1 font-body text-[13px] text-white">{sidebarData?.facilityName ?? ""}</p>
      </div>

      <div className="hidden items-center justify-between rounded-card bg-white px-6 py-5 border border-border-color lg:mx-5 lg:mt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Lab Requests</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{sidebarData?.facilityName ?? ""}</p>
        </div>
        {sidebarData?.name && (
          <IdentityMenu
            name={sidebarData.name}
            subtitle={`${sidebarData.facilityName} · Lab Technician`}
            profileHref="/lab-technician/profile"
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 pt-5 lg:mx-5 lg:px-0">
        <DashStat label="Pending" value={pendingCount} />
        <DashStat label="In Progress" value={inProgressCount} />
        <DashStat label="Completed Today" value={completedTodayCount} />
      </div>

      <LabQueueClient requests={requests} />
    </main>
  );
}

function DashStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card bg-white py-4 text-center border border-border-color">
      <p className="font-heading text-2xl font-bold text-lilac-deeper">{value}</p>
      <p className="font-body text-xs text-text-secondary">{label}</p>
    </div>
  );
}
