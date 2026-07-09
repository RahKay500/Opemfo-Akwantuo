import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilityAdminsClient from "./FacilityAdminsClient";

export default async function AdminFacilityAdminsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  const admins = await prisma.superAdmin.findMany({
    where: { facilityId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { facility: { select: { name: true } } },
  });

  return (
    <>
      <Header
        title="Facility Admins"
        action={
          <Link
            href="/admin/facility-admins/new"
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
          >
            Add Facility Admin
          </Link>
        }
      />
      <div className="px-4 py-6 lg:px-8">
        <FacilityAdminsClient
          admins={admins.map((a) => ({
            id: a.id,
            phone: a.phone,
            facilityId: a.facilityId,
            facilityName: a.facility?.name ?? null,
            isActive: a.isActive,
            hasPassword: Boolean(a.passwordHash),
            createdAt: a.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
