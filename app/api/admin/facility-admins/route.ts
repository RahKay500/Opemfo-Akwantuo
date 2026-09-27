import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin, signAdminActivationToken } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createFacilityAdminSchema } from "@/lib/validations/admin";
import { sendAdminActivationEmail, isEmailUnconfigured } from "@/lib/email";

// The Platform Super Admin can list/create Facility Admins anywhere; a
// District Admin can too, but only within their own district. A Facility
// Admin has no visibility into other facilities' admins.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.districtId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admins = await prisma.superAdmin.findMany({
    where: {
      facilityId: { not: null },
      ...(session.districtId !== null ? { facility: { districtId: session.districtId } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { facility: { select: { name: true } } },
  });

  return NextResponse.json({
    success: true,
    data: admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      facilityId: a.facilityId,
      facilityName: a.facility?.name ?? null,
      isActive: a.isActive,
      hasPassword: Boolean(a.passwordHash),
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.districtId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createFacilityAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const phone = parsed.data.phone ? normalizeGhanaPhone(parsed.data.phone) : null;
  if (parsed.data.phone && !phone) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const existingEmail = await prisma.superAdmin.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ success: false, error: "This email is already registered." }, { status: 409 });
  }
  if (phone) {
    const existingPhone = await prisma.superAdmin.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ success: false, error: "This phone number is already registered." }, { status: 409 });
    }
  }

  const facility = await prisma.facility.findUnique({ where: { id: parsed.data.facilityId } });
  if (!facility || !facility.isActive) {
    return NextResponse.json({ success: false, error: "Selected facility is not available." }, { status: 400 });
  }
  // A District Admin can only create Facility Admins for a facility inside
  // their own district — never trust the client-supplied facilityId alone.
  if (session.districtId !== null && facility.districtId !== session.districtId) {
    return NextResponse.json({ success: false, error: "Selected facility is not available." }, { status: 400 });
  }

  const admin = await prisma.superAdmin.create({
    data: {
      name: parsed.data.name,
      email,
      phone,
      facilityId: facility.id,
      isActive: false,
    },
  });

  await logAudit({
    actorLabel: isPlatformAdmin(session) ? "Super Admin" : "District Admin",
    action: "FACILITY_ADMIN_CREATED",
    entityType: "SuperAdmin",
    entityId: admin.id,
    metadata: { facilityId: facility.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const activationToken = await signAdminActivationToken(admin.id);
  const link = `${request.nextUrl.origin}/admin/activate/link?token=${activationToken}`;
  await sendAdminActivationEmail(email, link, "Facility Admin", facility.name);

  return NextResponse.json({
    success: true,
    data: { id: admin.id, email, ...(isEmailUnconfigured() ? { devLink: link } : {}) },
  });
}
