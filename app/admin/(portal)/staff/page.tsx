import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import StaffClient from "./StaffClient";

// A Facility Admin manages their own facility's staff (session.facilityId).
// A Platform Super Admin has no facility of their own, but still needs a way
// to reach a facility's staff when it currently has no Facility Admin (e.g.
// right after deleting one) — they get there via ?facilityId= from the
// Facilities page's "Staff" link instead of an implicit session scope.
// Regional/District Admin staff management isn't built yet — redirected
// away rather than given free rein over an arbitrary ?facilityId=.
export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ facilityId?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const platform = isPlatformAdmin(session);
  if (!platform && session.facilityId === null) redirect("/admin/dashboard");

  const { facilityId: queryFacilityId } = await searchParams;
  const facilityId = session.facilityId ?? queryFacilityId;
  if (!facilityId) redirect("/admin/facilities");

  const facility = platform
    ? await prisma.facility.findUnique({ where: { id: facilityId }, select: { name: true } })
    : null;
  if (platform && !facility) notFound();

  const staff = await prisma.user.findMany({
    where: { role: { in: ["MIDWIFE", "DOCTOR"] }, facilityId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title={facility ? `Staff — ${facility.name}` : "Staff"}
        showSearch={false}
        action={
          <Link
            href={`/admin/staff/new${platform ? `?facilityId=${facilityId}` : ""}`}
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
          >
            Add Staff
          </Link>
        }
      />
      <div className="px-4 py-6 lg:px-8">
        <StaffClient
          staff={staff.map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
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
