import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createReferralSchema } from "@/lib/validations/referrals";
import { sendReferralCreatedSms } from "@/lib/hubtel";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createReferralSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: parsed.data.patientId } });
  if (!patient || patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const toFacility = await prisma.facility.findUnique({ where: { id: parsed.data.toFacilityId } });
  if (!toFacility) {
    return NextResponse.json({ error: "Destination facility not found." }, { status: 404 });
  }

  const referral = await prisma.referral.create({
    data: {
      patientId: patient.id,
      fromFacilityId: session.facilityId,
      toFacilityId: toFacility.id,
      initiatedById: session.userId,
      priority: parsed.data.priority,
      systemSuggestedPriority: parsed.data.systemSuggestedPriority,
      nurseOverrideReason: parsed.data.nurseOverrideReason,
      reason: parsed.data.reason,
      additionalNotes: parsed.data.additionalNotes,
      transportMethod: parsed.data.transportMethod,
      includeHistory: parsed.data.includeHistory,
      includeVitals: parsed.data.includeVitals,
      includeFlags: parsed.data.includeFlags,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "REFERRAL_CREATED",
    entityType: "Referral",
    entityId: referral.id,
    metadata: { priority: referral.priority, toFacilityId: toFacility.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  if (toFacility.phone) {
    await sendReferralCreatedSms(toFacility.phone, patient.emergencyContactPhone, patient.name);
  }

  if (patient.userId) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "REFERRAL",
        title: `You've been referred to ${toFacility.name}`,
        message: `Your midwife has referred you for further care. You'll be notified as your referral progresses.`,
        relatedId: referral.id,
        relatedType: "Referral",
      },
    });
  }

  return NextResponse.json({ referral });
}
