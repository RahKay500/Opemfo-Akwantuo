import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createVideoSchema } from "@/lib/validations/videos";

// A Midwife's Learn & Prepare content — the User-session counterpart to
// app/api/admin/videos/route.ts's SuperAdmin-session flow, writing to the
// same Video table. A Midwife can only ever publish to her own facility's
// mothers (never platform-wide) — the same ceiling Facility Admin already
// has.
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const videos = await prisma.video.findMany({
    where: { facilityId: session.facilityId, addedById: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ videos });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const midwife = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });

  const video = await prisma.video.create({
    data: {
      title: parsed.data.title,
      url: parsed.data.url,
      mimeType: parsed.data.mimeType,
      category: parsed.data.category,
      facilityId: session.facilityId,
      addedById: session.userId,
      addedByLabel: `${midwife?.name ?? "Midwife"} (Midwife)`,
    },
  });

  await logAudit({
    actorId: session.userId,
    facilityId: session.facilityId,
    action: "VIDEO_ADDED",
    entityType: "Video",
    entityId: video.id,
    metadata: { title: video.title, category: video.category },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ video });
}
