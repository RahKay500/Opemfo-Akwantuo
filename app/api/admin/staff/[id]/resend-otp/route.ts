import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { generateOtp } from "@/lib/auth";
import { sendStaffActivationSms, isSmsUnconfigured } from "@/lib/hubtel";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const staff = await prisma.user.findUnique({ where: { id: params.id } });
  if (!staff || (staff.role !== "MIDWIFE" && staff.role !== "DOCTOR")) {
    return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
  }
  if (staff.isActive) {
    return NextResponse.json({ success: false, error: "Account is already active." }, { status: 400 });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);
  await prisma.user.update({ where: { id: staff.id }, data: { otp, otpExpiry } });

  await sendStaffActivationSms(staff.phone, otp);

  await logAudit({
    actorLabel: "Super Admin",
    action: "STAFF_OTP_RESENT",
    entityType: "User",
    entityId: staff.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({
    success: true,
    data: { phone: staff.phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
