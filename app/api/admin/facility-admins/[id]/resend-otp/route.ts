import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin, signAdminActivationToken } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { generateOtp } from "@/lib/auth";
import { sendFacilityAdminActivationSms, isSmsUnconfigured } from "@/lib/hubtel";
import { sendAdminActivationEmail, isEmailUnconfigured } from "@/lib/email";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.districtId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admin = await prisma.superAdmin.findUnique({
    where: { id: params.id },
    include: { facility: { select: { name: true, districtId: true } } },
  });
  if (
    !admin ||
    admin.facilityId === null ||
    (!admin.email && !admin.phone) ||
    (session.districtId !== null && admin.facility?.districtId !== session.districtId)
  ) {
    return NextResponse.json({ success: false, error: "Facility Admin not found." }, { status: 404 });
  }
  if (admin.isActive) {
    return NextResponse.json({ success: false, error: "Account is already active." }, { status: 400 });
  }

  await logAudit({
    actorLabel: isPlatformAdmin(session) ? "Super Admin" : "District Admin",
    action: "FACILITY_ADMIN_OTP_RESENT",
    entityType: "SuperAdmin",
    entityId: admin.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  // Email is the mandatory identifier for every admin created after this
  // account-creation flow was introduced — prefer it. Only accounts created
  // before then (phone-only, no email) fall back to the original SMS-OTP path.
  if (admin.email) {
    const activationToken = await signAdminActivationToken(admin.id);
    const link = `${request.nextUrl.origin}/admin/activate/link?token=${activationToken}`;
    await sendAdminActivationEmail(admin.email, link, "Facility Admin", admin.facility?.name ?? "your facility");
    return NextResponse.json({
      success: true,
      data: { email: admin.email, ...(isEmailUnconfigured() ? { devLink: link } : {}) },
    });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);
  await prisma.superAdmin.update({ where: { id: admin.id }, data: { otp, otpExpiry } });
  await sendFacilityAdminActivationSms(admin.phone!, otp, admin.facility?.name ?? "your facility");

  return NextResponse.json({
    success: true,
    data: { phone: admin.phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
