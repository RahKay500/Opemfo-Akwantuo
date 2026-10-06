import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSetupToken } from "@/lib/auth";
import { otpVerifySchema } from "@/lib/validations/auth";
import { clientIp, limitAttempts, TOO_MANY_ATTEMPTS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone, otp } = parsed.data;
  if (!limitAttempts("otp-verify-ip", clientIp(request), 30) || !limitAttempts("otp-verify-phone", phone, 10)) {
    return NextResponse.json({ error: TOO_MANY_ATTEMPTS }, { status: 429 });
  }
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !user.otp || !user.otpExpiry) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  if (user.otp !== otp || user.otpExpiry < new Date()) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otp: null, otpExpiry: null },
  });

  const setupToken = await signSetupToken(user.id);
  return NextResponse.json({ setupToken });
}
