import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifePatientList } from "@/lib/queries/midwife-patients";
import { getMidwifeSidebarData } from "@/lib/queries/midwife-sidebar";
import { initials } from "@/lib/utils";
import { BellIcon } from "@/components/ui/icons";
import LogVitalsForm from "./LogVitalsForm";

export default async function MidwifeLogVitalsPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { patientId } = await searchParams;

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
        <h1 className="font-heading text-xl font-bold text-text-primary">Log Vitals</h1>
        <BellIcon className="absolute right-5 size-[22px] text-text-primary" />
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Log Vitals</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{sidebarData?.facilityName ?? ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {sidebarData?.activeEmergency && (
            <span className="flex items-center gap-1.5 rounded-badge bg-critical-bg px-3 py-1.5 font-body text-[13px] font-bold text-critical">
              <span className="size-1.5 rounded-badge bg-critical" />1 Emergency
            </span>
          )}
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(sidebarData?.name ?? "")}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-5 lg:px-5 lg:pt-6">
        <LogVitalsForm
          patients={patients.map((p) => ({ id: p.id, name: p.name, week: p.week }))}
          initialPatientId={patientId ?? null}
        />
      </div>
    </main>
  );
}
