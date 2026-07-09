import { NextResponse, type NextRequest } from "next/server";
import { requestFacilityAdminActivation } from "@/lib/admin-auth";
import { normalizeGhanaPhone } from "@/lib/utils";
import { activateAdminRequestSchema } from "@/lib/validations/admin";
import { isSmsUnconfigured } from "@/lib/hubtel";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = activateAdminRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const result = await requestFacilityAdminActivation(phone);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: { phone, ...(isSmsUnconfigured() ? { devOtp: result.otp } : {}) },
  });
}
