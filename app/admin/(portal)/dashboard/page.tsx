import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession, getCurrentAdminIdentity } from "@/lib/current-admin";
import { getAdminDashboardData } from "@/lib/queries/admin-dashboard";
import Header from "@/components/admin/Header";
import StatsCard from "@/components/admin/StatsCard";
import PatientGrowthChart from "@/components/admin/PatientGrowthChart";
import RecentActivityTable from "./RecentActivityTable";
import FacilitiesOverviewTable from "./FacilitiesOverviewTable";
import type { PlatformDashboardData } from "@/lib/queries/admin-dashboard";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [data, identity] = await Promise.all([
    getAdminDashboardData(session.facilityId),
    getCurrentAdminIdentity(),
  ]);
  const isFacilityAdmin = session.facilityId !== null;

  return (
    <>
      <Header
        title={isFacilityAdmin ? `Dashboard — ${data.facilityName ?? "Your Facility"}` : "Dashboard"}
        subtitle={!isFacilityAdmin ? identity?.orgName : undefined}
        action={
          isFacilityAdmin ? (
            <Link
              href="/admin/staff/new"
              className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
            >
              Add Staff
            </Link>
          ) : (
            <Link
              href="/admin/facility-admins/new"
              className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
            >
              Add Facility Admin
            </Link>
          )
        }
      />

      <div className="px-4 py-6 lg:px-8">
        {isFacilityAdmin || !data.platform ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatsCard label="Total Midwives/Nurses" value={data.totalNurses} />
              <StatsCard label="Total Doctors" value={data.totalDoctors} />
              <StatsCard label="Pending Activation" value={data.pendingActivation} />
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-[#1A1A2E]">Recent activity</h2>
              <RecentActivityTable
                rows={data.recentActivity.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
              />
            </div>
          </>
        ) : (
          <PlatformDashboard platform={data.platform} />
        )}
      </div>
    </>
  );
}

function PlatformDashboard({ platform }: { platform: PlatformDashboardData }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Total Facilities"
          value={platform.totalFacilities}
          caption={`+${platform.facilitiesThisQuarter} this quarter`}
          color="purple"
        />
        <StatsCard
          label="Registered Patients"
          value={platform.registeredPatients}
          caption={`+${platform.registeredPatientsThisMonth} this month`}
          color="pink"
        />
        <StatsCard label="Active Staff" value={platform.activeStaff} caption="Across all facilities" color="green" />
        <StatsCard
          label="Facility Admins"
          value={platform.facilityAdminsCount}
          caption={`${platform.unassignedFacilities.length} facilities unassigned`}
          color="orange"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">Patient Growth — Last 6 Months</h2>
          <PatientGrowthChart data={platform.patientGrowth} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#1A1A2E]">Quick Actions</h2>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/admin/facilities"
                className="rounded-md border border-dashed border-[#D8B4FE] bg-[#FAF5FF] px-4 py-2.5 text-sm font-medium text-[#7C3AED]"
              >
                + Add New Facility
              </Link>
              <Link
                href="/admin/facility-admins/new"
                className="rounded-md border border-dashed border-[#D8B4FE] bg-[#FAF5FF] px-4 py-2.5 text-sm font-medium text-[#7C3AED]"
              >
                + Add Facility Admin
              </Link>
            </div>
          </div>

          {platform.unassignedFacilities.length > 0 && (
            <div className="rounded-lg bg-[#FFF7ED] p-5">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-[#EA580C]">
                <span aria-hidden>⚠</span>
                {platform.unassignedFacilities.length} Facilities Unassigned
              </p>
              <p className="mt-1.5 text-sm text-[#7C2D12]">
                {platform.unassignedFacilities.map((f) => f.name).join(" and ")} have no facility admin. Assign one
                to ensure proper oversight.
              </p>
              <Link
                href="/admin/facility-admins/new"
                className="mt-3 inline-block rounded-md bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white"
              >
                Assign Now
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-[#E2E8F0] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">Facilities Overview</h2>
          <Link href="/admin/facilities" className="text-sm font-medium text-[#7C3AED]">
            View all →
          </Link>
        </div>

        <div className="mt-4">
          <FacilitiesOverviewTable facilities={platform.facilitiesOverview.slice(0, 8)} />
        </div>
      </div>
    </>
  );
}
