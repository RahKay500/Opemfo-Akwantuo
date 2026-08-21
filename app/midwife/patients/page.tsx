import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifePatientList } from "@/lib/queries/midwife-patients";
import { getMidwifeSidebarData } from "@/lib/queries/midwife-sidebar";
import { shortFacilityName } from "@/lib/utils";
import IdentityMenu from "@/components/ui/IdentityMenu";
import { BellIcon } from "@/components/ui/icons";
import PatientListClient from "./PatientListClient";

export default async function MidwifePatientsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [patients, sidebarData] = await Promise.all([
    getMidwifePatientList(user.id),
    getMidwifeSidebarData(user.id),
  ]);
  if (!patients) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">No facility is linked to this account yet.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="relative flex items-center justify-center border-b border-border-color bg-white px-5 pb-4 pt-14 lg:hidden">
        <h1 className="font-heading text-xl font-bold text-text-primary">My Patients</h1>
        <BellIcon className="absolute right-5 size-[22px] text-text-primary" />
      </div>

      <div className="hidden items-center justify-between rounded-card bg-white px-6 py-5 border border-border-color lg:mx-5 lg:mt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Patients</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{sidebarData?.facilityName ?? ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {sidebarData?.activeEmergency && (
            <span className="flex items-center gap-1.5 rounded-badge bg-critical-bg px-3 py-1.5 font-body text-[13px] font-bold text-critical">
              <span className="size-1.5 rounded-badge bg-critical" />1 Emergency
            </span>
          )}
          {sidebarData?.name && (
            <IdentityMenu
              name={sidebarData.name}
              subtitle={sidebarData.facilityName ? `${shortFacilityName(sidebarData.facilityName)} · Midwife` : null}
              profileHref="/midwife/profile"
              avatarSize="sm"
            />
          )}
        </div>
      </div>

      <PatientListClient patients={patients} />
    </main>
  );
}
