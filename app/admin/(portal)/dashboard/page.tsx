import Link from "next/link";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import { getAdminDashboardData } from "@/lib/queries/admin-dashboard";
import Header from "@/components/admin/Header";
import StatsCard from "@/components/admin/StatsCard";
import RecentActivityTable from "./RecentActivityTable";

export default async function AdminDashboardPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  const data = await getAdminDashboardData();

  return (
    <>
      <Header
        title="Dashboard"
        action={
          <Link
            href="/admin/staff/new"
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
          >
            Add Staff
          </Link>
        }
      />

      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4">
          <StatsCard label="Total Facilities" value={data.totalFacilities} />
          <StatsCard label="Total Nurses" value={data.totalNurses} />
          <StatsCard label="Total Doctors" value={data.totalDoctors} />
          <StatsCard label="Pending Activation" value={data.pendingActivation} />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-[#1A1A2E]">Recent activity</h2>
          <RecentActivityTable
            rows={data.recentActivity.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          />
        </div>
      </div>
    </>
  );
}
