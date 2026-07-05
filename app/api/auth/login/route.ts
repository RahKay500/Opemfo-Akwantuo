import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !user.passwordHash || !user.isActive) {
    return NextResponse.json({ error: "Invalid phone number or password." }, { status: 401 });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid phone number or password." }, { status: 401 });
  }

  const tokenPayload = { userId: user.id, role: user.role, facilityId: user.facilityId };
  const accessToken = await signAccessToken(tokenPayload);
  const refreshToken = await signRefreshToken(tokenPayload);

  await logAudit({
    actorId: user.id,
    action: "LOGIN",
    entityType: "User",
    entityId: user.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role, facilityId: user.facilityId },
  });
  setAuthCookies(response, accessToken, refreshToken);
  return response;
}
