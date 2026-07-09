import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createStaffSchema } from "@/lib/validations/admin";
import { generateOtp } from "@/lib/auth";
import { sendStaffActivationSms, isSmsUnconfigured } from "@/lib/hubtel";

// Staff management is exclusively a Facility Admin's job (session.facilityId
// set) — the Platform Super Admin (facilityId: null) manages facilities and
// Facility Admin accounts instead, never staff directly.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId === null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const q = searchParams.get("q");

  const staff = await prisma.user.findMany({
    where: {
      role: role === "MIDWIFE" || role === "DOCTOR" ? role : { in: ["MIDWIFE", "DOCTOR"] },
      facilityId: session.facilityId,
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { facility: { select: { name: true } } },
  });

  return NextResponse.json({
    success: true,
    data: staff.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      role: s.role,
      facilityId: s.facilityId,
      facilityName: s.facility?.name ?? null,
      isActive: s.isActive,
      hasPassword: Boolean(s.passwordHash),
      createdAt: s.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId === null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const phone = normalizeGhanaPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ success: false, error: "This phone number is already registered." }, { status: 409 });
  }

  const facility = await prisma.facility.findUnique({ where: { id: session.facilityId } });
  if (!facility || !facility.isActive) {
    return NextResponse.json({ success: false, error: "Your facility is not available." }, { status: 400 });
  }

  // Plaintext, matching the existing OTP verify flow's comparison (User.otp is
  // compared directly, not hashed) — the mobile app's activation flow needs
  // to read the same value back.
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  const staff = await prisma.user.create({
    data: {
      name: parsed.data.name,
      phone,
      role: parsed.data.role,
      facilityId: facility.id,
      licenseNumber: parsed.data.licenseNumber || null,
      isActive: false,
      otp,
      otpExpiry,
    },
  });

  await logAudit({
    actorLabel: "Super Admin",
    facilityId: facility.id,
    action: "STAFF_CREATED",
    entityType: "User",
    entityId: staff.id,
    metadata: { role: staff.role, facilityId: facility.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  await sendStaffActivationSms(phone, otp);

  return NextResponse.json({
    success: true,
    data: { id: staff.id, phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
