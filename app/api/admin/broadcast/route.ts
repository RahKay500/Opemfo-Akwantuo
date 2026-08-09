import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { broadcastSchema } from "@/lib/validations/admin";
import { sendAdminBroadcastSms } from "@/lib/hubtel";

// Platform-only — sends a notice to every active Facility Admin, both
// in-app (AdminNotification) and by SMS.
export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, message } = parsed.data;

  const recipients = await prisma.superAdmin.findMany({
    where: { facilityId: { not: null }, isActive: true },
    select: { id: true, phone: true },
  });

  await prisma.adminNotification.createMany({
    data: recipients.map((r) => ({ superAdminId: r.id, title, message })),
  });

  for (const recipient of recipients) {
    if (recipient.phone) {
      await sendAdminBroadcastSms(recipient.phone, title, message);
    }
  }

  await logAudit({
    actorLabel: "Platform Super Admin",
    action: "ADMIN_BROADCAST_SENT",
    entityType: "AdminNotification",
    entityId: "broadcast",
    metadata: { title, message, recipientCount: recipients.length },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: { recipientCount: recipients.length } });
}
