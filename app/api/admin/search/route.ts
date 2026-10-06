import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { getVisibleFacilityIds } from "@/lib/current-admin";

// Admins search facilities and staff only. Patients are deliberately not
// searchable here: admins manage facilities and staff, and clinical records
// are not part of their role.
// Platform Super Admin searches across every facility; a Regional/District
// Admin searches within their jurisdiction; a Facility Admin searches only
// within their own facility's staff. A Facility Admin has no use for a
// cross-facility facilities list, so that part is Platform/Regional/District only.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }
  const platform = isPlatformAdmin(session);
  const visibleFacilityIds = await getVisibleFacilityIds(session);

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ success: true, data: { facilities: [], staff: [] } });
  }

  const facilityFilter = visibleFacilityIds ? { facilityId: { in: visibleFacilityIds } } : {};

  const [facilities, staff] = await Promise.all([
    session.facilityId === null
      ? prisma.facility.findMany({
          where: {
            name: { contains: q, mode: "insensitive" },
            ...(platform ? {} : { id: { in: visibleFacilityIds ?? [] } }),
          },
          select: { id: true, name: true, district: { select: { name: true, region: { select: { name: true } } } } },
          take: 5,
        })
      : Promise.resolve([]),
    prisma.user.findMany({
      where: {
        role: { in: ["MIDWIFE", "DOCTOR", "LAB_TECHNICIAN"] },
        name: { contains: q, mode: "insensitive" },
        ...facilityFilter,
      },
      select: { id: true, name: true, role: true, facilityId: true, facility: { select: { name: true } } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      facilities: facilities.map((f) => ({
        id: f.id,
        name: f.name,
        subtitle: `${f.district.name}, ${f.district.region.name}`,
      })),
      staff: staff.map((s) => ({
        id: s.id,
        name: s.name,
        subtitle: `${s.role === "MIDWIFE" ? "Midwife" : s.role === "DOCTOR" ? "Doctor" : "Lab Technician"} · ${s.facility?.name ?? "Unassigned"}`,
        facilityId: s.facilityId,
      })),
    },
  });
}
