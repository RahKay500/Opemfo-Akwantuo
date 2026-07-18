import { redirect } from "next/navigation";
import { getAdminSession, getCurrentAdminIdentity } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import PatientsClient from "./PatientsClient";

export default async function AdminPatientsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId === null) redirect("/admin/dashboard");

  const [patients, identity] = await Promise.all([
    prisma.patient.findMany({
      where: { facilityId: session.facilityId },
      orderBy: { createdAt: "desc" },
    }),
    getCurrentAdminIdentity(),
  ]);

  return (
    <>
      <Header title="Patients" subtitle={identity?.orgName} />
      <div className="px-4 py-6 lg:px-8">
        <PatientsClient
          patients={patients.map((p) => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            dateOfBirth: p.dateOfBirth.toISOString(),
            edd: p.edd ? p.edd.toISOString() : null,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
