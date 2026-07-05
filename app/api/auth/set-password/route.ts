import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  verifySetupToken,
} from "@/lib/auth";
import { setPasswordSchema } from "@/lib/validations/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = setPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { setupToken, password } = parsed.data;

  let userId: string;
  try {
    ({ userId } = await verifySetupToken(setupToken));
  } catch {
    return NextResponse.json({ error: "Setup session expired. Please verify your OTP again." }, { status: 401 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, isActive: true },
  });

  await logAudit({
    actorId: user.id,
    action: "ACCOUNT_CREATED",
    entityType: "User",
    entityId: user.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const tokenPayload = { userId: user.id, role: user.role, facilityId: user.facilityId };
  const accessToken = await signAccessToken(tokenPayload);
  const refreshToken = await signRefreshToken(tokenPayload);

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
  });
  setAuthCookies(response, accessToken, refreshToken);
  return response;
}
