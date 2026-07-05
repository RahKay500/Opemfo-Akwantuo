import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeProfileData } from "@/lib/queries/midwife-profile";
import { initials } from "@/lib/utils";
import { ChevronRightIcon } from "@/components/ui/icons";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function MidwifeProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMidwifeProfileData(user.id);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">No facility is linked to this account yet.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="flex flex-col items-center rounded-b-3xl bg-primary pb-7 pt-14">
        <div className="flex size-[88px] items-center justify-center rounded-badge bg-lilac-light">
          <span className="font-heading text-3xl font-bold text-lilac-deeper">{initials(data.name)}</span>
        </div>
        <p className="mt-2.5 font-heading text-2xl font-bold text-lilac-deeper">{data.name}</p>
        <p className="mt-0.5 font-body text-[13px] text-lilac-deeper/75">Midwife · {data.facilityName}</p>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
        <div className="flex rounded-card bg-white py-4 shadow-card">
          <div className="flex-1 text-center">
            <p className="font-body text-xs text-[#9CA3AF]">Patients</p>
            <p className="mt-0.5 font-heading text-xl font-bold text-text-primary">{data.patientsCount}</p>
          </div>
          <div className="w-px bg-lilac-light" />
          <div className="flex-1 text-center">
            <p className="font-body text-xs text-[#9CA3AF]">Referrals</p>
            <p className="mt-0.5 font-heading text-xl font-bold text-text-primary">{data.referralsCount}</p>
          </div>
          <div className="w-px bg-lilac-light" />
          <div className="flex-1 text-center">
            <p className="font-body text-xs text-[#9CA3AF]">Since</p>
            <p className="mt-0.5 font-heading text-xl font-bold text-text-primary">{data.memberSince}</p>
          </div>
        </div>

        <div>
          <p className="px-1 pb-2 font-body text-xs font-medium text-[#9CA3AF]">Personal information</p>
          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <Row label="Full Name" value={data.name} />
            <Row label="Phone" value={data.phone} last />
          </div>
        </div>

        <div>
          <p className="px-1 pb-2 font-body text-xs font-medium text-[#9CA3AF]">Work</p>
          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <Row label="Facility" value={data.facilityName} last />
          </div>
        </div>

        <div>
          <p className="px-1 pb-2 font-body text-xs font-medium text-[#9CA3AF]">Account</p>
          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <Row label="Language" value="English" />
            <Row label="Help & Support" value="" last />
          </div>
        </div>

        <div className="overflow-hidden rounded-card bg-white shadow-card">
          <LogoutButton variant="row" />
        </div>
      </div>
    </main>
  );
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
