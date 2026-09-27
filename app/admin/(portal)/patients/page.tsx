import { redirect } from "next/navigation";
import { getAdminSession, getVisibleFacilityIds } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import PatientsClient from "./PatientsClient";

// Platform sees every patient; a Regional/District Admin sees every patient
// within their jurisdiction (view access only — no edit affordances here for
// any tier, this page has always been read-only); a Facility Admin sees just
// their own facility's patients. Facility name is shown whenever a session
// spans more than one facility, not just for Platform.
export default async function AdminPatientsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const visibleFacilityIds = await getVisibleFacilityIds(session);
  const showFacility = isPlatformAdmin(session) || session.regionId !== null || session.districtId !== null;

  const patients = await prisma.patient.findMany({
    where: visibleFacilityIds ? { facilityId: { in: visibleFacilityIds } } : {},
    orderBy: { createdAt: "desc" },
    include: showFacility ? { facility: { select: { name: true } } } : undefined,
  });

  return (
    <>
      <Header title="Patients" subtitle={isPlatformAdmin(session) ? "All facilities" : undefined} showSearch={false} />
      <div className="px-4 py-6 lg:px-8">
        <PatientsClient
          patients={patients.map((p) => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            dateOfBirth: p.dateOfBirth.toISOString(),
            edd: p.edd ? p.edd.toISOString() : null,
            createdAt: p.createdAt.toISOString(),
            facilityName: showFacility ? ((p as { facility?: { name: string } }).facility?.name ?? null) : null,
          }))}
          showFacility={showFacility}
        />
      </div>
    </>
  );
}
