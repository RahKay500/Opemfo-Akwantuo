import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { updateStaffProfileSchema } from "@/lib/validations/staff-profile";

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStaffProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, staffId, dateOfBirth, gender, email, serviceStartDate } = parsed.data;

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name,
      licenseNumber: staffId || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      email: email || null,
      serviceStartDate: serviceStartDate ? new Date(serviceStartDate) : null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "PROFILE_UPDATED",
    entityType: "User",
    entityId: session.userId,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true });
}
