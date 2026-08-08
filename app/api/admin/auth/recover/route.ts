import { NextResponse, type NextRequest } from "next/server";
import { recoverSuperAdminPassword } from "@/lib/admin-auth";
import { recoverAdminSchema } from "@/lib/validations/admin";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = recoverAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input." }, { status: 400 });
  }

  const newEmail = parsed.data.newEmail || undefined;

  const result = await recoverSuperAdminPassword(
    parsed.data.email,
    parsed.data.envPassword,
    parsed.data.newPassword,
    newEmail
  );
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 401 });
  }

  await logAudit({
    actorLabel: "Super Admin (recovery)",
    action: "ADMIN_PASSWORD_RECOVERED",
    entityType: "SuperAdmin",
    entityId: parsed.data.email,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true });
}
