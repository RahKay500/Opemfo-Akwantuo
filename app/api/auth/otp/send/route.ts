import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";
import { isSmsUnconfigured, sendOtpSms } from "@/lib/hubtel";
import { otpSendSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = otpSendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });

  if (!existing) {
    // Accounts are never created from a bare phone number anymore — a mother
    // must first be registered by a midwife (POST /api/patients), and staff
    // must first be provisioned by the Super Admin. This just activates a
    // pending account, it never originates one.
    return NextResponse.json(
      {
        error:
          "No pending account found for this number. Ask your midwife/nurse or Super Admin to register you first.",
      },
      { status: 404 }
    );
  }

  if (existing.isActive) {
    return NextResponse.json(
      { error: "This phone number already has an account. Please log in instead." },
      { status: 409 }
    );
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);
  await prisma.user.update({ where: { id: existing.id }, data: { otp, otpExpiry } });

  await sendOtpSms(phone, otp);

  return NextResponse.json({ message: "OTP sent.", ...(isSmsUnconfigured() ? { devOtp: otp } : {}) });
}
