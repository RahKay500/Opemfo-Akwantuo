import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSessionFromRequest, confirmPasswordChange } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

const confirmSchema = z.object({ otp: z.string().length(6) });

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter the 6-digit code." }, { status: 400 });
  }

  const result = await confirmPasswordChange(session.sub, parsed.data.otp);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  await logAudit({
    actorLabel: "Super Admin",
    action: "ADMIN_PASSWORD_CHANGED",
    entityType: "SuperAdmin",
    entityId: session.sub,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true });
}
