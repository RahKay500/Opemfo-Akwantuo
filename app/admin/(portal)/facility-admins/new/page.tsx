import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import NewFacilityAdminForm from "./NewFacilityAdminForm";

export default async function NewFacilityAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  const facilities = await prisma.facility.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <>
      <Header title="Add Facility Admin" />
      <div className="px-4 py-6 lg:px-8">
        <NewFacilityAdminForm facilities={facilities.map((f) => ({ id: f.id, name: f.name }))} />
      </div>
    </>
  );
}
