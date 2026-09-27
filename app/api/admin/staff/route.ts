import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createStaffSchema } from "@/lib/validations/admin";
import { signSetupToken } from "@/lib/auth";
import { sendStaffActivationEmail, isEmailUnconfigured } from "@/lib/email";

// A Facility Admin manages their own facility's staff (session.facilityId).
// The Platform Super Admin (facilityId: null) doesn't manage staff day to
// day, but still needs oversight access — e.g. to reach a facility's staff
// right after deleting that facility's only admin — via an explicit
// ?facilityId= instead of an implicit session scope.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }
  // Regional/District Admin staff management isn't built yet — the
  // session-facilityId-or-explicit-query-param fallback below is only safe
  // for Platform (unrestricted) or a Facility Admin (session already scopes
  // it); anyone else would be able to pass an arbitrary facilityId.
  if (session.facilityId === null && !isPlatformAdmin(session)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const q = searchParams.get("q");
  const facilityId = session.facilityId ?? searchParams.get("facilityId");
  if (!facilityId) {
    return NextResponse.json({ success: false, error: "Select a facility." }, { status: 400 });
  }

  const staff = await prisma.user.findMany({
    where: {
      role: role === "MIDWIFE" || role === "DOCTOR" ? role : { in: ["MIDWIFE", "DOCTOR"] },
      facilityId,
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
  if (!session || (session.facilityId === null && !isPlatformAdmin(session))) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  // A Facility Admin's own facility always wins, ignoring any client-
  // supplied facilityId; only the Platform Super Admin's request needs one.
  const facilityId = session.facilityId ?? parsed.data.facilityId;
  if (!facilityId) {
    return NextResponse.json({ success: false, error: "Select a facility." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const phone = parsed.data.phone ? normalizeGhanaPhone(parsed.data.phone) : null;
  if (parsed.data.phone && !phone) {
    return NextResponse.json({ success: false, error: "Invalid phone number." }, { status: 400 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ success: false, error: "This email is already registered." }, { status: 409 });
  }
  if (phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ success: false, error: "This phone number is already registered." }, { status: 409 });
    }
  }

  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility || !facility.isActive) {
    return NextResponse.json({ success: false, error: "Selected facility is not available." }, { status: 400 });
  }

  const staff = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone,
      role: parsed.data.role,
      facilityId: facility.id,
      licenseNumber: parsed.data.licenseNumber || null,
      isActive: false,
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

  const setupToken = await signSetupToken(staff.id, "48h");
  const link = `${request.nextUrl.origin}/set-password?token=${setupToken}`;
  await sendStaffActivationEmail(email, link, staff.role === "DOCTOR" ? "Doctor" : "Midwife");

  return NextResponse.json({
    success: true,
    data: { id: staff.id, email, ...(isEmailUnconfigured() ? { devLink: link } : {}) },
  });
}
