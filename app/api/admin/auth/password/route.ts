import { NextResponse, type NextRequest } from "next/server";
import { getAdminSessionFromRequest, requestPasswordChange } from "@/lib/admin-auth";
import { changeAdminPasswordSchema } from "@/lib/validations/admin";
import { logAudit } from "@/lib/audit";
import { isSmsUnconfigured } from "@/lib/hubtel";

// Step 1: verifies the current password and sends a confirmation OTP to the
// admin's own phone. The new password isn't applied until POST
// /api/admin/auth/password/confirm succeeds.
export async function PUT(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changeAdminPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await requestPasswordChange(session.sub, parsed.data.currentPassword, parsed.data.newPassword);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  await logAudit({
    actorLabel: "Super Admin",
    action: "ADMIN_PASSWORD_CHANGE_REQUESTED",
    entityType: "SuperAdmin",
    entityId: session.sub,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({
    success: true,
    data: { phone: result.phone, ...(isSmsUnconfigured() ? { devOtp: result.otp } : {}) },
  });
}
