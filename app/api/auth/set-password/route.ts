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

  const before = await prisma.user.findUnique({ where: { id: userId } });
  if (!before) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    },
  });

  // A midwife may have already registered this phone number as a Patient
  // in-clinic before the mother ever downloaded the app. On first activation,
  // link her new account back to that existing record instead of leaving two
  // disconnected identities — and adopt the clinically-recorded real name
  // over the OTP flow's placeholder "New Mother".
  if (!before.isActive && user.role === "MOTHER") {
    const existingPatient = await prisma.patient.findFirst({
      where: { phone: user.phone, userId: null },
    });
    if (existingPatient) {
      await prisma.$transaction([
        prisma.patient.update({ where: { id: existingPatient.id }, data: { userId: user.id } }),
        prisma.user.update({ where: { id: user.id }, data: { name: existingPatient.name } }),
      ]);
      user.name = existingPatient.name;
    }
  }

  // Distinguish: brand-new account (mother OTP onboarding, or staff
  // registration finalizing without re-collecting a password) vs an existing,
  // already-active account changing its password via forgot-password.
  const action = !before.isActive ? "ACCOUNT_CREATED" : "PASSWORD_RESET";
  await logAudit({
    actorId: user.id,
    action,
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
