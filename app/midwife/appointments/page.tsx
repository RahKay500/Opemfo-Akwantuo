import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeAppointments } from "@/lib/queries/midwife-appointments";
import { getMidwifeSidebarData } from "@/lib/queries/midwife-sidebar";
import { initials } from "@/lib/utils";
import AppointmentQueueClient from "./AppointmentQueueClient";

export default async function MidwifeAppointmentsPage() {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const [appointments, sidebarData] = await Promise.all([
    getMidwifeAppointments(user.facilityId),
    getMidwifeSidebarData(user.id),
  ]);

  return (
    <main className="flex flex-col">
      <div className="flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-heading text-[22px] font-bold text-white">Appointment Requests</p>
        <p className="mt-1 font-body text-[13px] text-white">{sidebarData?.facilityName ?? ""}</p>
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Appointment Requests</h1>
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

      <AppointmentQueueClient appointments={appointments} />
    </main>
  );
}
