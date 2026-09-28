import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { broadcastSchema } from "@/lib/validations/admin";
import { sendAdminBroadcastSms } from "@/lib/hubtel";

const ALL_STAFF_ROLES = ["MIDWIFE", "DOCTOR", "LAB_TECHNICIAN"] as const;

// Platform-only. Resolves which facilities are in scope (null = every
// facility), then sends to one of three recipient pools:
//  - ADMINS: Facility Admins (SuperAdmin), via the existing AdminNotification
//    model + its bell UI.
//  - STAFF: Midwife/Doctor/Lab Technician accounts, via the generic
//    Notification model (no staff bell UI exists yet — SMS is the primary
//    channel for this pool, same gap already accepted for lab requests).
//  - MOTHERS: Mother accounts, via Notification — surfaced in their existing
//    notifications screen under a Broadcasts tab.
export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || !isPlatformAdmin(session)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, message, audience, scope, regionId, districtId, facilityId, roles } = parsed.data;

  let facilityIds: string[] | null = null;
  if (scope === "FACILITY") {
    if (!facilityId) {
      return NextResponse.json({ success: false, error: "Select a facility." }, { status: 400 });
    }
    facilityIds = [facilityId];
  } else if (scope === "DISTRICT") {
    if (!districtId) {
      return NextResponse.json({ success: false, error: "Select a district." }, { status: 400 });
    }
    const facilities = await prisma.facility.findMany({ where: { districtId }, select: { id: true } });
    facilityIds = facilities.map((f) => f.id);
  } else if (scope === "REGION") {
    if (!regionId) {
      return NextResponse.json({ success: false, error: "Select a region." }, { status: 400 });
    }
    const facilities = await prisma.facility.findMany({ where: { district: { regionId } }, select: { id: true } });
    facilityIds = facilities.map((f) => f.id);
  }

  let recipientCount = 0;

  if (audience === "ADMINS") {
    const admins = await prisma.superAdmin.findMany({
      where: {
        facilityId: facilityIds ? { in: facilityIds } : { not: null },
        isActive: true,
      },
      select: { id: true, phone: true },
    });
    await prisma.adminNotification.createMany({
      data: admins.map((a) => ({ superAdminId: a.id, title, message })),
    });
    for (const admin of admins) {
      if (admin.phone) await sendAdminBroadcastSms(admin.phone, title, message);
    }
    recipientCount = admins.length;
  } else if (audience === "STAFF") {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: roles && roles.length > 0 ? roles : [...ALL_STAFF_ROLES] },
        isActive: true,
        ...(facilityIds ? { facilityId: { in: facilityIds } } : {}),
      },
      select: { id: true, phone: true },
    });
    await prisma.notification.createMany({
      data: staff.map((s) => ({ userId: s.id, type: "ANNOUNCEMENT", title, message })),
    });
    for (const member of staff) {
      if (member.phone) await sendAdminBroadcastSms(member.phone, title, message);
    }
    recipientCount = staff.length;
  } else {
    const mothers = await prisma.user.findMany({
      where: {
        role: "MOTHER",
        isActive: true,
        ...(facilityIds ? { patient: { facilityId: { in: facilityIds } } } : {}),
      },
      select: { id: true, phone: true },
    });
    await prisma.notification.createMany({
      data: mothers.map((m) => ({ userId: m.id, type: "ANNOUNCEMENT", title, message })),
    });
    for (const mother of mothers) {
      if (mother.phone) await sendAdminBroadcastSms(mother.phone, title, message);
    }
    recipientCount = mothers.length;
  }

  await logAudit({
    actorLabel: "Platform Super Admin",
    action: "ADMIN_BROADCAST_SENT",
    entityType: "AdminNotification",
    entityId: "broadcast",
    metadata: { title, message, audience, scope, regionId, districtId, facilityId, roles, recipientCount },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: { recipientCount } });
}
