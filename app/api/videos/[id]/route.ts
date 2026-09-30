import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;

  const video = await prisma.video.findUnique({ where: { id } });
  // A Midwife can only ever delete content she added herself — this doubles
  // as the ownership check (mirrors app/api/admin/videos/[id]/route.ts).
  if (!video || video.addedById !== session.userId) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  await prisma.video.delete({ where: { id } });

  await logAudit({
    actorId: session.userId,
    facilityId: session.facilityId,
    action: "VIDEO_DELETED",
    entityType: "Video",
    entityId: id,
    metadata: { title: video.title },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true });
}
