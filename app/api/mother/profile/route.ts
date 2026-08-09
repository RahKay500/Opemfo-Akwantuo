import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  const { name, dateOfBirth, bloodGroup, emergencyContactName, emergencyContactPhone } = parsed.data;

  await prisma.$transaction([
    prisma.patient.update({
      where: { id: patient.id },
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        bloodGroup: bloodGroup || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
      },
    }),
    prisma.user.update({ where: { id: session.userId }, data: { name } }),
  ]);

  await logAudit({
    actorId: session.userId,
    action: "PROFILE_UPDATED",
    entityType: "Patient",
    entityId: patient.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true });
}
