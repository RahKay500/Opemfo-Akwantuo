import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { createVideoSchema } from "@/lib/validations/videos";

// A Facility Admin manages their own facility's videos (shown only to their
// own mothers); the Platform Super Admin manages the global list (shown to
// every mother, alongside the app's curated catalogue) — same facilityId:
// null-vs-set scoping used everywhere else in the admin portal. Regional/
// District Admin video management isn't built yet, so they're rejected
// outright rather than being able to post to the platform-wide list (which
// is what session.facilityId: null would otherwise resolve to for them).
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (session.facilityId === null && !isPlatformAdmin(session))) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    where: { facilityId: session.facilityId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: videos.map((v) => ({
      id: v.id,
      title: v.title,
      url: v.url,
      mimeType: v.mimeType,
      category: v.category,
      createdAt: v.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (session.facilityId === null && !isPlatformAdmin(session))) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      title: parsed.data.title,
      url: parsed.data.url,
      mimeType: parsed.data.mimeType,
      category: parsed.data.category,
      facilityId: session.facilityId,
      addedById: session.sub,
      addedByLabel: session.facilityId ? "Facility Admin" : "Platform Admin",
    },
  });

  await logAudit({
    actorLabel: session.facilityId ? "Facility Admin" : "Super Admin",
    facilityId: session.facilityId,
    action: "VIDEO_ADDED",
    entityType: "Video",
    entityId: video.id,
    metadata: { title: video.title, category: video.category },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: { id: video.id } });
}
