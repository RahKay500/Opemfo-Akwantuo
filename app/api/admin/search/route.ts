import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

// Platform Super Admin only — a Facility Admin's own facility already has
// dedicated Staff/Patients list pages, so a cross-facility search isn't
// useful to that tier the way it is for the Super Admin overseeing all of
// them at once.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ success: true, data: { facilities: [], staff: [], patients: [] } });
  }

  const [facilities, staff, patients] = await Promise.all([
    prisma.facility.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, district: true, region: true },
      take: 5,
    }),
    prisma.user.findMany({
      where: { role: { in: ["MIDWIFE", "DOCTOR"] }, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, role: true, facilityId: true, facility: { select: { name: true } } },
      take: 5,
    }),
    prisma.patient.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, phone: true, facilityId: true, facility: { select: { name: true } } },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      facilities: facilities.map((f) => ({ id: f.id, name: f.name, subtitle: `${f.district}, ${f.region}` })),
      staff: staff.map((s) => ({
        id: s.id,
        name: s.name,
        subtitle: `${s.role === "MIDWIFE" ? "Midwife" : "Doctor"} · ${s.facility?.name ?? "Unassigned"}`,
        facilityId: s.facilityId,
      })),
      patients: patients.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: `${p.phone} · ${p.facility.name}`,
        facilityId: p.facilityId,
      })),
    },
  });
}
