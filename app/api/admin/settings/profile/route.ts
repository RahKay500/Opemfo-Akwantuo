import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { updateAdminProfileSchema } from "@/lib/validations/admin";

// Lets a logged-in admin (either tier) set their own display name and
// organisational affiliation — shown in the sidebar/header identity card.
export async function PUT(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAdminProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = await prisma.superAdmin.update({ where: { id: session.sub }, data: parsed.data });

  await logAudit({
    actorLabel: "Super Admin",
    action: "ADMIN_PROFILE_UPDATED",
    entityType: "SuperAdmin",
    entityId: admin.id,
    metadata: { changes: parsed.data },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: { name: admin.name, orgName: admin.orgName } });
}
