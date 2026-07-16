import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeProfileData } from "@/lib/queries/midwife-profile";
import { getMidwifeSidebarData } from "@/lib/queries/midwife-sidebar";
import { formatDate, initials } from "@/lib/utils";
import { ChevronRightIcon, LocationPinIcon, PencilIcon, PhoneCallIcon, ShieldCheckIcon } from "@/components/ui/icons";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function MidwifeProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [data, sidebarData] = await Promise.all([
    getMidwifeProfileData(user.id),
    getMidwifeSidebarData(user.id),
  ]);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">No facility is linked to this account yet.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="relative flex items-center justify-center border-b border-border-color bg-white px-5 pb-4 pt-14 lg:hidden">
        <h1 className="font-heading text-xl font-bold text-text-primary">My Profile</h1>
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">My Profile</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{data.facilityName}</p>
        </div>
        <div className="flex items-center gap-3">
          {sidebarData?.activeEmergency && (
            <span className="flex items-center gap-1.5 rounded-badge bg-critical-bg px-3 py-1.5 font-body text-[13px] font-bold text-critical">
              <span className="size-1.5 rounded-badge bg-critical" />1 Emergency
            </span>
          )}
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(data.name)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-8 pt-5 lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:col-start-1">
          <div className="flex flex-col items-center rounded-card bg-white p-6 text-center shadow-card lg:p-8">
            <div className="flex size-24 items-center justify-center rounded-badge bg-lilac-light lg:size-28">
              <span className="font-heading text-3xl font-bold text-lilac-deeper lg:text-4xl">
                {initials(data.name)}
              </span>
            </div>
            <p className="mt-3 font-heading text-xl font-bold text-text-primary lg:text-2xl">{data.name}</p>
            <p className="mt-0.5 font-body text-[13px] text-text-secondary lg:text-sm">Registered Midwife</p>
            {data.isVerified && (
              <span className="mt-3 flex items-center gap-1.5 rounded-badge bg-[#F0FDF4] px-3 py-1.5 font-body text-[13px] font-bold text-[#16A34A]">
                <ShieldCheckIcon className="size-4" />
                GHS Verified
              </span>
            )}
            <Link
              href="/midwife/profile/edit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-card border-[1.5px] border-border-color py-3 font-body text-sm font-bold text-text-primary"
            >
              <PencilIcon className="size-4" />
              Edit Profile
            </Link>
          </div>

          <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
            <p className="font-heading text-base font-bold text-text-primary">Contact & Location</p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <PhoneCallIcon className="size-4 text-text-secondary" />
                <p className="font-body text-sm text-text-primary">{data.phone}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <LocationPinIcon className="size-4 text-text-secondary" />
                <p className="font-body text-sm text-text-primary">
                  {data.facilityName}, {data.facilityRegion}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-start-2">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatTile label="Patients Under Care" value={String(data.patientsCount)} />
            <StatTile label="Visits This Month" value={String(data.visitsThisMonthCount)} />
            <StatTile label="Referrals Sent" value={String(data.referralsCount)} />
            <StatTile label="Avg. Response Time" value={data.avgResponseTimeLabel ?? "—"} />
          </div>

          <div className="rounded-card bg-white p-5 shadow-card lg:p-6">
            <p className="font-heading text-base font-bold text-text-primary">Personal Information</p>
            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
              <InfoField label="Full Name" value={data.name} />
              <InfoField label="Staff ID" value={data.staffId ?? "Not set"} />
              <InfoField label="Date of Birth" value={data.dateOfBirth ? formatDate(data.dateOfBirth) : "Not set"} />
              <InfoField label="Gender" value={genderLabel(data.gender)} />
              <InfoField label="Email" value={data.email ?? "Not set"} />
              <InfoField
                label="Years of Service"
                value={data.yearsOfService != null ? `${data.yearsOfService} year${data.yearsOfService === 1 ? "" : "s"}` : "Not set"}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <Row label="Language" value="English" />
            <Row label="Help & Support" value="" last />
          </div>

          <LogoutButton variant="card" />
        </div>
      </div>
    </main>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card bg-white py-5 text-center shadow-card">
      <p className="font-heading text-2xl font-bold text-lilac-deeper lg:text-[28px]">{value}</p>
      <p className="font-body text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.06em] text-[#9CA3AF]">{label}</p>
      <p className="mt-1 font-body text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

function genderLabel(gender: string | null): string {
  if (gender === "FEMALE") return "Female";
  if (gender === "MALE") return "Male";
  if (gender === "OTHER") return "Other";
  return "Not set";
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex h-14 items-center justify-between px-4 ${last ? "" : "border-b border-[#F3ECF9]"}`}>
      <p className="font-body text-sm text-text-primary">{label}</p>
      <div className="flex items-center gap-2">
        {value && <p className="font-body text-sm text-text-secondary">{value}</p>}
        <ChevronRightIcon className="size-3.5 text-[#9CA3AF]" />
      </div>
    </div>
  );
}
