import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const notifications = await prisma.adminNotification.findMany({
    where: { superAdminId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ success: true, data: notifications });
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  await prisma.adminNotification.updateMany({
    where: { superAdminId: session.sub, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
