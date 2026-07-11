import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const shareSchema = z.object({
  doctorId: z.string().min(1),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || (session.role !== "MIDWIFE" && session.role !== "DOCTOR")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient || patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const [doctor, midwife] = await Promise.all([
    prisma.user.findUnique({ where: { id: parsed.data.doctorId } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
  ]);
  if (!doctor || doctor.role !== "DOCTOR") {
    return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  }

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const share = await prisma.referralShare.create({
    data: {
      patientId: patient.id,
      sharedByNurseId: session.userId,
      sharedWithDoctorId: doctor.id,
      reason: parsed.data.reason,
      expiresAt,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "RECORD_SHARED",
    entityType: "ReferralShare",
    entityId: share.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  await prisma.notification.create({
    data: {
      userId: doctor.id,
      type: "RECORD_SHARE",
      title: `Record shared: ${patient.name}`,
      message: `${midwife?.name ?? "A midwife/nurse"} shared ${patient.name}'s record with you for review.`,
      relatedId: share.id,
      relatedType: "ReferralShare",
    },
  });

  return NextResponse.json({ share });
}
