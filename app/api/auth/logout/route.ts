import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookies, verifyAccessToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (accessToken) {
    try {
      const { userId } = await verifyAccessToken(accessToken);
      await logAudit({
        actorId: userId,
        action: "LOGOUT",
        entityType: "User",
        entityId: userId,
        ipAddress: request.headers.get("x-forwarded-for"),
      });
    } catch {
      // Token already invalid/expired — nothing to audit, still clear cookies below.
    }
  }

  const response = NextResponse.json({ message: "Logged out." });
  clearAuthCookies(response);
  return response;
}
