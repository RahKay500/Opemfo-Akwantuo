import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import PatientsClient from "./PatientsClient";

export default async function AdminPatientsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const isPlatform = session.facilityId === null;

  const patients = await prisma.patient.findMany({
    where: isPlatform ? {} : { facilityId: session.facilityId as string },
    orderBy: { createdAt: "desc" },
    include: isPlatform ? { facility: { select: { name: true } } } : undefined,
  });

  return (
    <>
      <Header title="Patients" subtitle={isPlatform ? "All facilities" : undefined} showSearch={false} />
      <div className="px-4 py-6 lg:px-8">
        <PatientsClient
          patients={patients.map((p) => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            dateOfBirth: p.dateOfBirth.toISOString(),
            edd: p.edd ? p.edd.toISOString() : null,
            createdAt: p.createdAt.toISOString(),
            facilityName: isPlatform ? ((p as { facility?: { name: string } }).facility?.name ?? null) : null,
          }))}
          showFacility={isPlatform}
        />
      </div>
    </>
  );
}
