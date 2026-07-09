import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { updateFacilitySchema } from "@/lib/validations/admin";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateFacilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.facility.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Facility not found." }, { status: 404 });
  }

  const facility = await prisma.facility.update({ where: { id: params.id }, data: parsed.data });

  await logAudit({
    actorLabel: "Super Admin",
    action: parsed.data.isActive === false ? "FACILITY_DEACTIVATED" : parsed.data.isActive === true ? "FACILITY_REACTIVATED" : "FACILITY_UPDATED",
    entityType: "Facility",
    entityId: facility.id,
    metadata: { changes: parsed.data },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: facility });
}
