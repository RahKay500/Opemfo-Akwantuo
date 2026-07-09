import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { generateOtp } from "@/lib/auth";
import { sendFacilityAdminActivationSms, isSmsUnconfigured } from "@/lib/hubtel";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admin = await prisma.superAdmin.findUnique({
    where: { id: params.id },
    include: { facility: { select: { name: true } } },
  });
  if (!admin || admin.facilityId === null) {
    return NextResponse.json({ success: false, error: "Facility Admin not found." }, { status: 404 });
  }
  if (admin.isActive) {
    return NextResponse.json({ success: false, error: "Account is already active." }, { status: 400 });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);
  await prisma.superAdmin.update({ where: { id: admin.id }, data: { otp, otpExpiry } });

  await sendFacilityAdminActivationSms(admin.phone, otp, admin.facility?.name ?? "your facility");

  await logAudit({
    actorLabel: "Super Admin",
    action: "FACILITY_ADMIN_OTP_RESENT",
    entityType: "SuperAdmin",
    entityId: admin.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({
    success: true,
    data: { phone: admin.phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
