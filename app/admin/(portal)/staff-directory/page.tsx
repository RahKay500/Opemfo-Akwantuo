import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import StaffDirectoryClient from "./StaffDirectoryClient";

// Platform-only cross-facility staff list — a Facility Admin already has
// their own scoped view at /admin/staff.
export default async function AdminStaffDirectoryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/staff");

  const staff = await prisma.user.findMany({
    where: { role: { in: ["MIDWIFE", "DOCTOR"] } },
    include: { facility: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Staff Directory" subtitle="All facilities" showSearch={false} />
      <div className="px-4 py-6 lg:px-8">
        <StaffDirectoryClient
          staff={staff.map((s) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            role: s.role as "MIDWIFE" | "DOCTOR",
            facilityName: s.facility?.name ?? "—",
            isActive: s.isActive,
            hasPassword: Boolean(s.passwordHash),
          }))}
        />
      </div>
    </>
  );
}
