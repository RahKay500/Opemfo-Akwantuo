import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;

  const video = await prisma.video.findUnique({ where: { id } });
  // Scoped the same way the list is: a Facility Admin can only ever see (and
  // therefore only delete) their own facility's rows, so this doubles as
  // the ownership check.
  if (!video || video.facilityId !== session.facilityId) {
    return NextResponse.json({ success: false, error: "Video not found." }, { status: 404 });
  }

  await prisma.video.delete({ where: { id } });

  await logAudit({
    actorLabel: session.facilityId ? "Facility Admin" : "Super Admin",
    facilityId: session.facilityId,
    action: "VIDEO_DELETED",
    entityType: "Video",
    entityId: id,
    metadata: { title: video.title },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true });
}
