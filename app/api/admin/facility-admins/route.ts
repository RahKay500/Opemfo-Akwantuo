import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createFacilityAdminSchema } from "@/lib/validations/admin";
import { generateOtp } from "@/lib/auth";
import { sendFacilityAdminActivationSms, isSmsUnconfigured } from "@/lib/hubtel";

// Only the Platform Super Admin (facilityId: null) can list/create Facility
// Admins — a Facility Admin has no visibility into other facilities' admins.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admins = await prisma.superAdmin.findMany({
    where: { facilityId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { facility: { select: { name: true } } },
  });

  return NextResponse.json({
    success: true,
    data: admins.map((a) => ({
      id: a.id,
      phone: a.phone,
      facilityId: a.facilityId,
      facilityName: a.facility?.name ?? null,
      isActive: a.isActive,
      hasPassword: Boolean(a.passwordHash),
      createdAt: a.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createFacilityAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const existing = await prisma.superAdmin.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ success: false, error: "This phone number is already registered." }, { status: 409 });
  }

  const facility = await prisma.facility.findUnique({ where: { id: parsed.data.facilityId } });
  if (!facility || !facility.isActive) {
    return NextResponse.json({ success: false, error: "Selected facility is not available." }, { status: 400 });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  const admin = await prisma.superAdmin.create({
    data: { phone, facilityId: facility.id, isActive: false, otp, otpExpiry },
  });

  await logAudit({
    actorLabel: "Super Admin",
    action: "FACILITY_ADMIN_CREATED",
    entityType: "SuperAdmin",
    entityId: admin.id,
    metadata: { facilityId: facility.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  await sendFacilityAdminActivationSms(phone, otp, facility.name);

  return NextResponse.json({
    success: true,
    data: { id: admin.id, phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
