import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import StaffClient from "./StaffClient";

export default async function AdminStaffPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId === null) redirect("/admin/dashboard");

  const staff = await prisma.user.findMany({
    where: { role: { in: ["MIDWIFE", "DOCTOR"] }, facilityId: session.facilityId },
    orderBy: { createdAt: "desc" },
  });

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
      <div className="px-4 py-6 lg:px-8">
        <StaffClient
          staff={staff.map((s) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            role: s.role as "MIDWIFE" | "DOCTOR",
            isActive: s.isActive,
            hasPassword: Boolean(s.passwordHash),
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
