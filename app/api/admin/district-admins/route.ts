import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createDistrictAdminSchema } from "@/lib/validations/admin";
import { generateOtp } from "@/lib/auth";
import { sendAdminActivationSms, isSmsUnconfigured } from "@/lib/hubtel";

// The Platform Super Admin can list/create District Admins anywhere; a
// Regional Admin can too, but only within their own region.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.regionId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admins = await prisma.superAdmin.findMany({
    where: {
      districtId: { not: null },
      ...(session.regionId !== null ? { districtScope: { regionId: session.regionId } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { districtScope: { select: { name: true, region: { select: { name: true } } } } },
  });

  return NextResponse.json({
    success: true,
    data: admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      districtId: a.districtId,
      districtName: a.districtScope?.name ?? null,
      regionName: a.districtScope?.region.name ?? null,
      isActive: a.isActive,
      hasPassword: Boolean(a.passwordHash),
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.regionId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createDistrictAdminSchema.safeParse(body);
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

  const district = await prisma.district.findUnique({
    where: { id: parsed.data.districtId },
    include: { region: { select: { id: true, name: true } } },
  });
  if (!district) {
    return NextResponse.json({ success: false, error: "Selected district is not available." }, { status: 400 });
  }
  // A Regional Admin can only create District Admins within their own
  // region — never trust the client-supplied districtId's region alone.
  if (session.regionId !== null && district.regionId !== session.regionId) {
    return NextResponse.json({ success: false, error: "Selected district is not available." }, { status: 400 });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  const admin = await prisma.superAdmin.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      phone,
      districtId: district.id,
      isActive: false,
      otp,
      otpExpiry,
    },
  });

  await logAudit({
    actorLabel: isPlatformAdmin(session) ? "Super Admin" : "Regional Admin",
    action: "DISTRICT_ADMIN_CREATED",
    entityType: "SuperAdmin",
    entityId: admin.id,
    metadata: { districtId: district.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  await sendAdminActivationSms(phone, otp, "District Admin", `${district.name}, ${district.region.name}`);

  return NextResponse.json({
    success: true,
    data: { id: admin.id, phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
