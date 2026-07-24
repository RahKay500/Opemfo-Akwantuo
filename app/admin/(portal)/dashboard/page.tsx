import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession, getCurrentAdminIdentity } from "@/lib/current-admin";
import { getAdminDashboardData } from "@/lib/queries/admin-dashboard";
import { facilityTypeLabel, formatDate, initials } from "@/lib/utils";
import Header from "@/components/admin/Header";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import PatientGrowthChart from "@/components/admin/PatientGrowthChart";
import FacilitiesOverviewTable from "./FacilitiesOverviewTable";
import type { PlatformDashboardData, FacilityAdminDashboardData } from "@/lib/queries/admin-dashboard";

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
        title="Dashboard"
        subtitle={isFacilityAdmin ? data.facility?.facilityName : identity?.orgName}
      />

      <div className="px-4 py-6 lg:px-8">
        {isFacilityAdmin
          ? data.facility && <FacilityAdminDashboard facility={data.facility} />
          : data.platform && <PlatformDashboard platform={data.platform} />}
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

const ROLE_LABELS: Record<string, string> = { MIDWIFE: "Midwife", DOCTOR: "Doctor" };

function FacilityAdminDashboard({ facility }: { facility: FacilityAdminDashboardData }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Total Staff" value={facility.totalStaff} caption={`${facility.activeStaff} active`} color="blue" />
        <StatsCard
          label="Total Patients"
          value={facility.totalPatients}
          caption={`+${facility.patientsThisWeek} this week`}
          color="pink"
        />
        <StatsCard
          label="Visits This Month"
          value={facility.visitsThisMonth}
          caption="Antenatal & postnatal"
          color="green"
        />
        <StatsCard
          label="Pending Referrals"
          value={facility.pendingReferrals}
          caption="Awaiting doctor review"
          color="orange"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1A1A2E]">Staff at {facility.facilityName}</h2>
            <Link href="/admin/staff" className="text-sm font-medium text-[#2663EB]">
              Manage →
            </Link>
          </div>
          <div className="mt-3 flex flex-col divide-y divide-[#E2E8F0]">
            {facility.staff.length === 0 && <p className="py-3 text-sm text-[#6B7280]">No staff added yet.</p>}
            {facility.staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-xs font-bold text-[#2663EB]">
                    {initials(s.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1A1A2E]">{s.name}</p>
                    <p className="text-xs text-[#6B7280]">{ROLE_LABELS[s.role] ?? s.role}</p>
                  </div>
                </div>
                <StatusBadge status={s.isActive ? "Active" : "Inactive"} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#1A1A2E]">Quick Actions</h2>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/admin/staff/new"
                className="rounded-md border border-dashed border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2.5 text-sm font-medium text-[#2663EB]"
              >
                + Add Staff Member
              </Link>
              <Link
                href="/admin/patients"
                className="rounded-md border border-dashed border-[#BFDBFE] bg-[#EFF6FF] px-4 py-2.5 text-sm font-medium text-[#2663EB]"
              >
                + View Patient List
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#1A1A2E]">Facility Info</h2>
            <dl className="mt-3 flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#6B7280]">Type</dt>
                <dd className="font-medium text-[#2663EB]">{facilityTypeLabel(facility.facilityInfo.type)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#6B7280]">District</dt>
                <dd className="font-medium text-[#2663EB]">{facility.facilityInfo.district}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#6B7280]">Region</dt>
                <dd className="font-medium text-[#2663EB]">{facility.facilityInfo.region}</dd>
              </div>
              {facility.facilityInfo.openedAt && (
                <div className="flex items-center justify-between">
                  <dt className="text-[#6B7280]">Opened</dt>
                  <dd className="font-medium text-[#2663EB]">{formatDate(facility.facilityInfo.openedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
