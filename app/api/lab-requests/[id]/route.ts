import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { updateLabRequestStatusSchema } from "@/lib/validations/lab-requests";
import { sendLabResultReadySms, isSmsUnconfigured } from "@/lib/hubtel";
import type { LabRequestStatus } from "@prisma/client";

// Forward-only progression, plus cancellation from any non-terminal state —
// same shape as Referral's ALLOWED_NEXT (app/api/referrals/[id]/route.ts).
const ALLOWED_NEXT: Record<LabRequestStatus, LabRequestStatus[]> = {
  REQUESTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["READY", "CANCELLED"],
  READY: [],
  CANCELLED: [],
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "LAB_TECHNICIAN" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateLabRequestStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const labRequest = await prisma.labRequest.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });
  if (!labRequest || labRequest.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Lab request not found." }, { status: 404 });
  }

  if (!ALLOWED_NEXT[labRequest.status].includes(parsed.data.status)) {
    return NextResponse.json(
      { error: `Cannot move a lab request from ${labRequest.status} to ${parsed.data.status}.` },
      { status: 400 }
    );
  }

  const isReady = parsed.data.status === "READY";
  const updated = await prisma.labRequest.update({
    where: { id: labRequest.id },
    data: {
      status: parsed.data.status,
      eta: parsed.data.eta ?? labRequest.eta,
      result: parsed.data.result ?? labRequest.result,
      isAbnormal: parsed.data.isAbnormal ?? labRequest.isAbnormal,
      ...(isReady ? { completedById: session.userId, completedAt: new Date() } : {}),
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "LAB_REQUEST_STATUS_UPDATED",
    entityType: "LabRequest",
    entityId: labRequest.id,
    metadata: { from: labRequest.status, to: parsed.data.status },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  if (isReady) {
    await prisma.notification.create({
      data: {
        userId: labRequest.requestedById,
        type: "LAB_RESULT",
        title: `${labRequest.testType} result ready`,
        message: `${labRequest.patient.name}'s ${labRequest.testType} result is ready to view.`,
        relatedId: labRequest.id,
        relatedType: "LabRequest",
      },
    });

    if (labRequest.patient.userId && labRequest.patient.notifyLabResults) {
      await prisma.notification.create({
        data: {
          userId: labRequest.patient.userId,
          type: "LAB_RESULT",
          title: "Your lab result is ready",
          message: `Your ${labRequest.testType} result is ready. Ask your midwife/nurse for the details.`,
          relatedId: labRequest.id,
          relatedType: "LabRequest",
        },
      });
    }

    await sendLabResultReadySms(labRequest.patient.phone, labRequest.testType);
  }

  return NextResponse.json({ labRequest: updated, ...(isSmsUnconfigured() && isReady ? { devSmsLogged: true } : {}) });
}
