import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createRegionalAdminSchema } from "@/lib/validations/admin";
import { generateOtp } from "@/lib/auth";
import { sendAdminActivationSms, isSmsUnconfigured } from "@/lib/hubtel";

// Only the Platform Super Admin can list/create Regional Admins — this is
// the top of the delegated hierarchy, so nothing above it to scope from.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || !isPlatformAdmin(session)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admins = await prisma.superAdmin.findMany({
    where: { regionId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: { regionScope: { select: { name: true } } },
  });

  return NextResponse.json({
    success: true,
    data: admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      regionId: a.regionId,
      regionName: a.regionScope?.name ?? null,
      isActive: a.isActive,
      hasPassword: Boolean(a.passwordHash),
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || !isPlatformAdmin(session)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createRegionalAdminSchema.safeParse(body);
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

  const region = await prisma.region.findUnique({ where: { id: parsed.data.regionId } });
  if (!region) {
    return NextResponse.json({ success: false, error: "Selected region is not available." }, { status: 400 });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  const admin = await prisma.superAdmin.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      phone,
      regionId: region.id,
      isActive: false,
      otp,
      otpExpiry,
    },
  });

  await logAudit({
    actorLabel: "Super Admin",
    action: "REGIONAL_ADMIN_CREATED",
    entityType: "SuperAdmin",
    entityId: admin.id,
    metadata: { regionId: region.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  await sendAdminActivationSms(phone, otp, "Regional Admin", region.name);

  return NextResponse.json({
    success: true,
    data: { id: admin.id, phone, ...(isSmsUnconfigured() ? { devOtp: otp } : {}) },
  });
}
