import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "DOCTOR") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const share = await prisma.referralShare.findUnique({ where: { id: params.id } });
  if (!share || share.sharedWithDoctorId !== session.userId) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const updated = await prisma.referralShare.update({
    where: { id: share.id },
    data: { isActive: false },
  });

  await logAudit({
    actorId: session.userId,
    action: "RECORD_REVIEWED",
    entityType: "ReferralShare",
    entityId: share.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ share: updated });
}
