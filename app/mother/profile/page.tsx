import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherProfileData } from "@/lib/queries/mother-profile";
import { formatDate, initials } from "@/lib/utils";
import LogoutButton from "@/components/ui/LogoutButton";
import PreferencesCard from "./PreferencesCard";
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
      <div className="px-5 pb-4 pt-14 text-center lg:pb-0 lg:pt-8 lg:text-left">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">My Profile</h1>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-8 pt-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:col-start-1">
          <div className="flex flex-col items-center rounded-card bg-white p-6 text-center shadow-card lg:p-10">
            <div className="flex size-20 items-center justify-center rounded-badge bg-lilac-light lg:size-28">
              <span className="font-heading text-2xl font-bold text-lilac-deeper lg:text-4xl">
                {initials(data.name)}
              </span>
            </div>
            <p className="mt-3 font-heading text-xl font-bold text-text-primary lg:mt-4 lg:text-2xl">{data.name}</p>
            <p className="mt-0.5 font-body text-[13px] text-text-secondary lg:text-sm">
              Patient · {data.facilityName}
            </p>
            {data.edd && (
              <span className="mt-4 rounded-badge bg-lilac-light px-4 py-2 font-body text-sm font-medium text-lilac-deeper">
                Week {data.currentWeek} · Due {formatDate(data.edd)}
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <div className="flex items-center justify-between px-5 pt-5">
              <p className="font-heading text-base font-bold text-text-primary">Personal Details</p>
              <Link href="/mother/profile/edit" className="font-body text-xs font-medium text-pink-deep">
                Edit
              </Link>
            </div>
            <div className="mt-2">
              <Row label="Phone" value={data.phone} />
              <Row label="Date of Birth" value={formatDate(data.dateOfBirth)} />
              <Row label="Ghana Card" value={data.ghanaCardId ?? "Not provided"} />
              <Row label="Community" value={data.community ?? "Not provided"} last />
            </div>
          </div>

          <div>
            <p className="px-1 pb-2 font-body text-xs font-medium text-text-secondary">Medical information</p>
            <div className="overflow-hidden rounded-card bg-white shadow-card">
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
        </div>

        <div className="flex flex-col gap-4 lg:col-start-2">
          <div className="overflow-hidden rounded-card bg-white shadow-card">
            <p className="px-5 pt-5 font-heading text-base font-bold text-text-primary">Pregnancy Info</p>
            <div className="mt-2">
              <Row label="Blood Group" value={data.bloodGroup ?? "Not recorded"} />
              <Row label="Gravida" value={data.gravida != null ? String(data.gravida) : "Not recorded"} />
              <Row label="Para" value={data.para != null ? String(data.para) : "Not recorded"} />
              <Row label="Midwife" value={data.midwifeName} />
              <Row label="CHPS" value={data.facilityName} last />
            </div>
          </div>

          <PreferencesCard
            initial={{
              notifyAppointments: data.notifyAppointments,
              notifyReferralUpdates: data.notifyReferralUpdates,
              notifyEducationalContent: data.notifyEducationalContent,
            }}
          />

          <div className="flex flex-col gap-2">
            <LogoutButton variant="card" />
            <DeleteAccountRow />
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex h-14 items-center justify-between px-5 ${last ? "" : "border-b border-border-color"}`}>
      <p className="font-body text-sm text-text-secondary">{label}</p>
      <p className="font-body text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}
