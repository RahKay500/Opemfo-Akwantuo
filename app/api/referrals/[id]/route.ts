import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { updateReferralStatusSchema } from "@/lib/validations/referrals";
import type { ReferralStatus } from "@prisma/client";

// Forward-only progression, plus cancellation from any non-terminal state.
const ALLOWED_NEXT: Record<ReferralStatus, ReferralStatus[]> = {
  SENT: ["ACKNOWLEDGED", "CANCELLED"],
  ACKNOWLEDGED: ["PATIENT_ARRIVED", "CANCELLED"],
  PATIENT_ARRIVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

function statusMessage(status: ReferralStatus, facilityName: string): string | null {
  if (status === "ACKNOWLEDGED") return `${facilityName} has reviewed your referral and is preparing to receive you.`;
  if (status === "PATIENT_ARRIVED") return `You've been checked in at ${facilityName}.`;
  if (status === "COMPLETED") return `Your visit at ${facilityName} has been marked complete.`;
  if (status === "CANCELLED") return `Your referral to ${facilityName} was cancelled.`;
  return null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const referral = await prisma.referral.findUnique({
    where: { id: params.id },
    include: { patient: { select: { id: true, name: true } }, toFacility: true, fromFacility: true },
  });
  if (!referral) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }

  const authorized =
    (session.role === "DOCTOR" && referral.toFacilityId === session.facilityId) ||
    (session.role === "MIDWIFE" && referral.initiatedById === session.userId);
  if (!authorized) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  return NextResponse.json({ referral });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "DOCTOR" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateReferralStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const referral = await prisma.referral.findUnique({
    where: { id: params.id },
    include: { patient: true, toFacility: true },
  });
  if (!referral || referral.toFacilityId !== session.facilityId) {
    return NextResponse.json({ error: "Referral not found." }, { status: 404 });
  }

  if (!ALLOWED_NEXT[referral.status].includes(parsed.data.status)) {
    return NextResponse.json(
      { error: `Cannot move a referral from ${referral.status} to ${parsed.data.status}.` },
      { status: 400 }
    );
  }

  const now = new Date();
  const timestampUpdate =
    parsed.data.status === "ACKNOWLEDGED"
      ? { acknowledgedAt: now }
      : parsed.data.status === "PATIENT_ARRIVED"
        ? { arrivedAt: now }
        : parsed.data.status === "COMPLETED"
          ? { completedAt: now }
          : {};

  const updated = await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: parsed.data.status,
      outcomeNotes: parsed.data.outcomeNotes ?? referral.outcomeNotes,
      ...timestampUpdate,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "REFERRAL_STATUS_UPDATED",
    entityType: "Referral",
    entityId: referral.id,
    metadata: { from: referral.status, to: parsed.data.status },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  if (referral.patient.userId && referral.patient.notifyReferralUpdates) {
    const message = statusMessage(parsed.data.status, referral.toFacility.name);
    if (message) {
      await prisma.notification.create({
        data: {
          userId: referral.patient.userId,
          type: "REFERRAL",
          title: "Referral update",
          message,
          relatedId: referral.id,
          relatedType: "Referral",
        },
      });
    }
  }

  return NextResponse.json({ referral: updated });
}
