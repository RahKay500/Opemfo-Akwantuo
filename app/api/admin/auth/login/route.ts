import { NextResponse, type NextRequest } from "next/server";
import { checkAdminCredentials, signAdminToken, setAdminCookie } from "@/lib/admin-auth";
import { adminLoginSchema } from "@/lib/validations/admin";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input." }, { status: 400 });
  }

  const admin = await checkAdminCredentials(parsed.data.identifier, parsed.data.password);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Invalid email/phone or password." }, { status: 401 });
  }

  const token = await signAdminToken(admin.id, admin.facilityId);
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
