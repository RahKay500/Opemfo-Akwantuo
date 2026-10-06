import { NextResponse, type NextRequest } from "next/server";
import { checkAdminCredentials, signAdminToken, setAdminCookie } from "@/lib/admin-auth";
import { adminLoginSchema } from "@/lib/validations/admin";
import { logAudit } from "@/lib/audit";
import { clientIp, limitAttempts, TOO_MANY_ATTEMPTS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input." }, { status: 400 });
  }

  if (
    !limitAttempts("admin-login-ip", clientIp(request), 30) ||
    !limitAttempts("admin-login-identifier", parsed.data.identifier.trim().toLowerCase(), 10)
  ) {
    return NextResponse.json({ success: false, error: TOO_MANY_ATTEMPTS }, { status: 429 });
  }

  const admin = await checkAdminCredentials(parsed.data.identifier, parsed.data.password);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Invalid email/phone or password." }, { status: 401 });
  }

  const token = await signAdminToken(admin.id, {
    facilityId: admin.facilityId,
    districtId: admin.districtId,
    regionId: admin.regionId,
  });
  const response = NextResponse.json({ success: true });
  setAdminCookie(response, token);

  await logAudit({
    actorLabel: "Super Admin",
    action: "ADMIN_LOGIN",
    entityType: "SuperAdmin",
    entityId: admin.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return response;
}
