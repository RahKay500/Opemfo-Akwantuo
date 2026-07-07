import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilitiesClient from "./FacilitiesClient";

export default async function AdminFacilitiesPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  const facilities = await prisma.facility.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <>
      <Header title="Facilities" />
      <div className="px-4 py-6 lg:px-8">
        <FacilitiesClient
          facilities={facilities.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            region: f.region,
            district: f.district,
            phone: f.phone,
            isActive: f.isActive,
            staffCount: f._count.users,
          }))}
        />
      </div>
    </>
  );
}
