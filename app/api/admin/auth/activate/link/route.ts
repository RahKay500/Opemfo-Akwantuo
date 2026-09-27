import { NextResponse, type NextRequest } from "next/server";
import { confirmAdminActivationByLink, signAdminToken, setAdminCookie } from "@/lib/admin-auth";
import { activateAdminLinkSchema } from "@/lib/validations/admin";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = activateAdminLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid input." }, { status: 400 });
  }

  const result = await confirmAdminActivationByLink(parsed.data.token, parsed.data.password);
  if (!result.success || !result.id) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  const token = await signAdminToken(result.id, {
    facilityId: result.facilityId ?? null,
    districtId: result.districtId ?? null,
    regionId: result.regionId ?? null,
  });
  const response = NextResponse.json({ success: true });
  setAdminCookie(response, token);

  const tier = result.facilityId ? "Facility" : result.districtId ? "District" : "Regional";
  await logAudit({
    actorLabel: `${tier} Admin`,
    facilityId: result.facilityId ?? null,
    action: `${tier.toUpperCase()}_ADMIN_ACTIVATED`,
    entityType: "SuperAdmin",
    entityId: result.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return response;
}
