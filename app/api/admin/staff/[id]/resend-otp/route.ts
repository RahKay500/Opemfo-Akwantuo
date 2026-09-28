import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { generateOtp, signSetupToken } from "@/lib/auth";
import { sendStaffActivationSms, isSmsUnconfigured } from "@/lib/hubtel";
import { sendStaffActivationEmail, isEmailUnconfigured } from "@/lib/email";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId === null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const staff = await prisma.user.findUnique({ where: { id: params.id } });
  if (
    !staff ||
    (staff.role !== "MIDWIFE" && staff.role !== "DOCTOR" && staff.role !== "LAB_TECHNICIAN") ||
    staff.facilityId !== session.facilityId
  ) {
    return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
  }
  if (staff.isActive) {
    return NextResponse.json({ success: false, error: "Account is already active." }, { status: 400 });
  }

  await logAudit({
    actorLabel: "Super Admin",
    facilityId: session.facilityId,
    action: "STAFF_OTP_RESENT",
    entityType: "User",
    entityId: staff.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  // Email is the mandatory identifier for every staff account created after
  // this activation flow was introduced — prefer it. Only accounts created
  // before then (phone-only, no email) fall back to the original SMS-OTP path.
  if (staff.email) {
    const setupToken = await signSetupToken(staff.id, "48h");
    const link = `${request.nextUrl.origin}/set-password?token=${setupToken}`;
    const roleLabel = staff.role === "DOCTOR" ? "Doctor" : staff.role === "LAB_TECHNICIAN" ? "Lab Technician" : "Midwife";
    await sendStaffActivationEmail(staff.email, link, roleLabel);
    return NextResponse.json({
      success: true,
      data: { email: staff.email, ...(isEmailUnconfigured() ? { devLink: link } : {}) },
    });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);
  await prisma.user.update({ where: { id: staff.id }, data: { otp, otpExpiry } });
  await sendStaffActivationSms(staff.phone!, otp);

  return NextResponse.json({
    success: true,
    data: { phone: staff.phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
