import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, clearAuthCookies } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { isActive: false },
  });

  await logAudit({
    actorId: session.userId,
    action: "ACCOUNT_DELETED",
    entityType: "User",
    entityId: session.userId,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
