import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let userId: string;
  try {
    ({ userId } = await verifyRefreshToken(refreshToken));
  } catch {
    return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
  }

  const tokenPayload = { userId: user.id, role: user.role, facilityId: user.facilityId };
  const newAccessToken = await signAccessToken(tokenPayload);
  const newRefreshToken = await signRefreshToken(tokenPayload);

  const response = NextResponse.json({ message: "Refreshed." });
  setAuthCookies(response, newAccessToken, newRefreshToken);
  return response;
}
