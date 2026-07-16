import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { updateReferralShareSchema } from "@/lib/validations/referral-shares";
import type { Prisma } from "@prisma/client";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "DOCTOR") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const share = await prisma.referralShare.findUnique({ where: { id: params.id } });
  if (!share || share.sharedWithDoctorId !== session.userId) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  // The mobile "Mark as Reviewed" button calls this with no body at all —
  // that's the legacy shorthand for markReviewed, kept working here.
  const body = await request.json().catch(() => ({}));
  const parsed = updateReferralShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Prisma.ReferralShareUpdateInput = {};
  if (parsed.data.doctorNotes !== undefined) data.doctorNotes = parsed.data.doctorNotes;
  if (parsed.data.markReviewed || Object.keys(parsed.data).length === 0) data.isActive = false;

  const updated = await prisma.referralShare.update({
    where: { id: share.id },
    data,
  });

  await logAudit({
    actorId: session.userId,
    action: data.doctorNotes !== undefined ? "RECORD_NOTE_ADDED" : "RECORD_REVIEWED",
    entityType: "ReferralShare",
    entityId: share.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ share: updated });
}
