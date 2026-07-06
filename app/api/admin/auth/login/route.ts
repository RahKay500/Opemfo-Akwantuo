import { NextResponse, type NextRequest } from "next/server";
import { checkAdminCredentials, signAdminToken, setAdminCookie } from "@/lib/admin-auth";
import { normalizeGhanaPhone } from "@/lib/utils";
import { adminLoginSchema } from "@/lib/validations/admin";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input." }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const valid = await checkAdminCredentials(phone, parsed.data.password);
  if (!valid) {
    return NextResponse.json({ success: false, error: "Invalid phone number or password." }, { status: 401 });
  }

  const token = await signAdminToken();
  const response = NextResponse.json({ success: true });
  setAdminCookie(response, token);

  await logAudit({
    actorLabel: "Super Admin",
    action: "ADMIN_LOGIN",
    entityType: "SuperAdmin",
    entityId: "super-admin",
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return response;
}
