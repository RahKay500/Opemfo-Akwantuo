import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherProfileData } from "@/lib/queries/mother-profile";
import { formatDate, initials } from "@/lib/utils";
import { ChevronRightIcon } from "@/components/ui/icons";
import LogoutButton from "@/components/ui/LogoutButton";
import DeleteAccountRow from "./DeleteAccountRow";

export default async function MotherProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMotherProfileData(user.id);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">
          No patient record is linked to this account yet.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="flex flex-col items-center rounded-b-3xl bg-primary pb-6 pt-14">
        <div className="flex size-20 items-center justify-center rounded-badge border-[3px] border-white bg-lilac-light">
          <span className="font-heading text-2xl font-bold text-lilac-deeper">{initials(data.name)}</span>
        </div>
        <p className="mt-3 font-heading text-[22px] font-bold text-white">{data.name}</p>
        <p className="mt-0.5 font-body text-[13px] text-white/70">
          Mother · Patient ID: {data.displayId}
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-8 pt-5">
        <div className="flex rounded-card bg-white p-5 shadow-card">
          <div className="flex-1 border-r border-border-color text-center">
            <p className="font-body text-xs text-text-secondary">Age</p>
            <p className="mt-1 font-heading text-xl font-bold text-text-primary">{data.age}</p>
          </div>
          <div className="flex-1 border-r border-border-color text-center">
            <p className="font-body text-xs text-text-secondary">Week</p>
            <p className="mt-1 font-heading text-xl font-bold text-text-primary">{data.currentWeek}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-body text-xs text-text-secondary">Visits</p>
            <p className="mt-1 font-heading text-xl font-bold text-text-primary">{data.visitsCount}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="font-body text-xs font-medium text-text-secondary">Personal information</p>
            <Link href="/mother/profile/edit" className="font-body text-xs font-medium text-pink-deep">
              Edit
            </Link>
          </div>
          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <Row label="Full Name" value={data.name} />
            <Row label="Phone" value={data.phone} />
            <Row label="Date of Birth" value={formatDate(data.dateOfBirth)} />
            <Row label="Ghana Card ID" value={data.ghanaCardId ?? "Not provided"} last />
          </div>
        </div>

        <div>
          <p className="px-1 pb-2 font-body text-xs font-medium text-text-secondary">Medical information</p>
          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <Row label="Blood Group" value={data.bloodGroup ?? "Not recorded"} />
            <Row label="Known Conditions" value={data.knownConditions ?? "None recorded"} />
            <Row
              label="Emergency Contact"
              value={
                data.emergencyContactName
                  ? `${data.emergencyContactName}${data.emergencyContactPhone ? ` · ${data.emergencyContactPhone}` : ""}`
                  : "Not provided"
              }
              last
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-card bg-white shadow-card">
          <LogoutButton variant="row" />
          <DeleteAccountRow />
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex h-14 items-center justify-between px-4 ${last ? "" : "border-b border-border-color"}`}>
      <p className="font-body text-sm text-text-primary">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-body text-sm text-text-secondary">{value}</p>
        <ChevronRightIcon className="size-3.5 text-[#9CA3AF]" />
      </div>
    </div>
  );
}
