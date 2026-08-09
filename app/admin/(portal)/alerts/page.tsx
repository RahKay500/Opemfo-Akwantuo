import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import AlertsClient from "./AlertsClient";

// Platform-only monitoring of emergency alerts across all facilities.
// Read-only — resolving an alert stays a midwife-side action (there is no
// resolve UI anywhere in the app yet; out of scope here).
export default async function AdminAlertsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  const alerts = await prisma.emergencyAlert.findMany({
    include: {
      patient: { select: { name: true, facility: { select: { name: true } } } },
      resolvedBy: { select: { name: true } },
    },
    orderBy: { triggeredAt: "desc" },
  });

  return (
    <>
      <Header title="Emergency Alerts" subtitle="All facilities" />
      <div className="px-4 py-6 lg:px-8">
        <AlertsClient
          alerts={alerts.map((a) => ({
            id: a.id,
            patientName: a.patient.name,
            facilityName: a.patient.facility.name,
            triggeredAt: a.triggeredAt.toISOString(),
            resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : null,
            resolvedByName: a.resolvedBy?.name ?? null,
            isActive: a.isActive,
          }))}
        />
      </div>
    </>
  );
}
