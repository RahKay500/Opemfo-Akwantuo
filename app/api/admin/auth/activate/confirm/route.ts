import { NextResponse, type NextRequest } from "next/server";
import { confirmFacilityAdminActivation, signAdminToken, setAdminCookie } from "@/lib/admin-auth";
import { normalizeGhanaPhone } from "@/lib/utils";
import { activateAdminConfirmSchema } from "@/lib/validations/admin";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = activateAdminConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input." }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const result = await confirmFacilityAdminActivation(phone, parsed.data.otp, parsed.data.password);
  if (!result.success || !result.id) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  const token = await signAdminToken(result.id, result.facilityId ?? null);
  const response = NextResponse.json({ success: true });
  setAdminCookie(response, token);

  await logAudit({
    actorLabel: "Facility Admin",
    facilityId: result.facilityId,
    action: "FACILITY_ADMIN_ACTIVATED",
    entityType: "SuperAdmin",
    entityId: result.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return response;
}
