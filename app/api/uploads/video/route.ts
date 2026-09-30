import { NextResponse, type NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSessionFromRequest } from "@/lib/auth";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";

// Issues a client-side Blob upload token for Learn & Prepare content. Either
// a Midwife (User session) or an Admin (SuperAdmin session, same gate as
// app/api/admin/videos/route.ts) may upload; no one else. Upload bytes go
// straight from the browser to Blob storage — this route only authorizes it.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  const [midwifeSession, adminSession] = await Promise.all([
    getSessionFromRequest(request),
    getAdminSessionFromRequest(request),
  ]);
  const isMidwife = midwifeSession?.role === "MIDWIFE" && Boolean(midwifeSession.facilityId);
  const isAdmin = adminSession && (adminSession.facilityId !== null || isPlatformAdmin(adminSession));
  if (!isMidwife && !isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime", "audio/mpeg", "audio/mp4", "audio/wav"],
        maximumSizeInBytes: 200 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
