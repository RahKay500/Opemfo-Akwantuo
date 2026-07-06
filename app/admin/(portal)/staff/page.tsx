import Link from "next/link";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import StaffClient from "./StaffClient";

export default async function AdminStaffPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  const [staff, facilities] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["MIDWIFE", "DOCTOR"] } },
      orderBy: { createdAt: "desc" },
      include: { facility: { select: { name: true } } },
    }),
    prisma.facility.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <Header
        title="Staff"
        action={
          <Link href="/admin/staff/new" className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white">
            Add Staff
          </Link>
        }
      />
      <div className="px-8 py-6">
        <StaffClient
          staff={staff.map((s) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            role: s.role as "MIDWIFE" | "DOCTOR",
            facilityId: s.facilityId,
            facilityName: s.facility?.name ?? null,
            isActive: s.isActive,
            hasPassword: Boolean(s.passwordHash),
            createdAt: s.createdAt.toISOString(),
          }))}
          facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
        />
      </div>
    </>
  );
}
