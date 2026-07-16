import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { forwardReferralShareSchema } from "@/lib/validations/referral-shares";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "DOCTOR") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = forwardReferralShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const original = await prisma.referralShare.findUnique({
    where: { id: params.id },
    include: { patient: { select: { id: true, name: true } } },
  });
  if (!original || original.sharedWithDoctorId !== session.userId) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }
  if (!original.patient) {
    return NextResponse.json({ error: "This record has no patient to forward." }, { status: 400 });
  }

  if (parsed.data.doctorId === session.userId) {
    return NextResponse.json({ error: "Choose a different doctor to forward to." }, { status: 400 });
  }

  const [targetDoctor, forwardingDoctor] = await Promise.all([
    prisma.user.findUnique({ where: { id: parsed.data.doctorId } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
  ]);
  if (!targetDoctor || targetDoctor.role !== "DOCTOR") {
    return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  }

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  // Provenance stays with the original referring nurse — forwarding is the
  // receiving doctor passing the record along, not a new referral.
  const forwarded = await prisma.referralShare.create({
    data: {
      referralId: original.referralId,
      patientId: original.patientId,
      sharedByNurseId: original.sharedByNurseId,
      sharedWithDoctorId: targetDoctor.id,
      reason: parsed.data.reason?.trim() || `Forwarded by ${forwardingDoctor?.name ?? "a doctor"}: ${original.reason ?? "no note provided"}`,
      expiresAt,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "RECORD_FORWARDED",
    entityType: "ReferralShare",
    entityId: forwarded.id,
    metadata: { fromShareId: original.id, toDoctorId: targetDoctor.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  await prisma.notification.create({
    data: {
      userId: targetDoctor.id,
      type: "RECORD_SHARE",
      title: `Record shared: ${original.patient.name}`,
      message: `${forwardingDoctor?.name ?? "A colleague"} forwarded ${original.patient.name}'s record to you for review.`,
      relatedId: forwarded.id,
      relatedType: "ReferralShare",
    },
  });

  return NextResponse.json({ share: forwarded });
}
