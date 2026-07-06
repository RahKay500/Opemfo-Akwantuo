import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";
import { sendOtpSms } from "@/lib/hubtel";

// Entirely separate from lib/auth.ts (mother/midwife/doctor sessions): its
// own secret, its own cookie, its own token shape, and its own SuperAdmin
// table — nothing here should touch the `access_token`/`refresh_token`
// cookies, JWT_ACCESS_SECRET, or the User table used by the rest of the app.
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.SUPER_ADMIN_JWT_SECRET ?? "dev-admin-secret-change-me"
);

export const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_EXPIRY = "8h";
const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

export interface AdminSessionPayload {
  sub: string; // SuperAdmin.id
}

export async function signAdminToken(adminId: string): Promise<string> {
  return new SignJWT({ sub: adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_SESSION_EXPIRY)
    .sign(ADMIN_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload> {
  const { payload } = await jwtVerify(token, ADMIN_SECRET);
  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Invalid admin token");
  }
  return payload as unknown as AdminSessionPayload;
}

// Runs on every login attempt (cheap — a single indexed count query). The
// very first time this app talks to a fresh database, the SuperAdmin table
// is empty, so this seeds exactly one row from the bootstrap env vars and
// never touches them again afterwards. Updating SUPER_ADMIN_PHONE/PASSWORD
// later has no effect once that row exists — password changes from then on
// go through changeAdminPassword, not env vars.
async function ensureSuperAdminBootstrapped(): Promise<void> {
  const count = await prisma.superAdmin.count();
  if (count > 0) return;

  const phone = process.env.SUPER_ADMIN_PHONE;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!phone || !password) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.superAdmin.create({ data: { phone, passwordHash } });
}

export async function checkAdminCredentials(phone: string, password: string): Promise<{ id: string } | null> {
  await ensureSuperAdminBootstrapped();

  const admin = await prisma.superAdmin.findUnique({ where: { phone } });
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  return valid ? { id: admin.id } : null;
}

// Step 1 of 2: verifies the current password and stages the new one, but
// doesn't apply it yet — an OTP sent to the admin's own phone must be
// confirmed first (confirmPasswordChange). This is what stops a hijacked
// but still-unlocked session from silently locking the real admin out: the
// attacker would also need the phone receiving that SMS.
export async function requestPasswordChange(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; phone?: string; otp?: string }> {
  const admin = await prisma.superAdmin.findUnique({ where: { id: adminId } });
  if (!admin) return { success: false, error: "Account not found." };

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect." };

  const pendingPasswordHash = await bcrypt.hash(newPassword, 12);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  await prisma.superAdmin.update({
    where: { id: adminId },
    data: { pendingPasswordHash, otp, otpExpiry },
  });

  await sendOtpSms(admin.phone, otp);
  return { success: true, phone: admin.phone, otp };
}

// Step 2 of 2: applies the staged password once the OTP is confirmed.
export async function confirmPasswordChange(
  adminId: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await prisma.superAdmin.findUnique({ where: { id: adminId } });
  if (!admin) return { success: false, error: "Account not found." };

  if (!admin.pendingPasswordHash || !admin.otp || !admin.otpExpiry) {
    return { success: false, error: "No password change is pending." };
  }
  if (admin.otp !== otp || admin.otpExpiry < new Date()) {
    return { success: false, error: "Invalid or expired code." };
  }

  await prisma.superAdmin.update({
    where: { id: adminId },
    data: { passwordHash: admin.pendingPasswordHash, pendingPasswordHash: null, otp: null, otpExpiry: null },
  });
  return { success: true };
}

// Last-resort recovery: re-entering the original bootstrap env-var
// credentials resets the database password directly, no current-password
// or OTP required. This is intentional — whoever controls the server's
// env vars is the ultimate owner of this account, matching how the
// SuperAdmin row itself is bootstrapped from those same vars in the first
// place. A session hijacker has no path to this without also compromising
// the server config, which is a different, higher trust boundary.
//
// An optional newPhone also covers succession: when the person holding this
// role leaves, whoever controls the env vars can hand the account to a
// replacement's phone number in the same step, rather than being stuck
// resetting a password for a number the outgoing admin still controls.
export async function recoverSuperAdminPassword(
  phone: string,
  envPassword: string,
  newPassword: string,
  newPhone?: string
): Promise<{ success: boolean; error?: string }> {
  const expectedPhone = process.env.SUPER_ADMIN_PHONE;
  const expectedPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!expectedPhone || !expectedPassword) {
    return { success: false, error: "Recovery is not configured on this server." };
  }
  if (phone !== expectedPhone || envPassword !== expectedPassword) {
    return { success: false, error: "Invalid recovery credentials." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const targetPhone = newPhone || phone;
  await prisma.superAdmin.upsert({
    where: { phone },
    update: { phone: targetPhone, passwordHash, pendingPasswordHash: null, otp: null, otpExpiry: null },
    create: { phone: targetPhone, passwordHash },
  });
  return { success: true };
}

const isProd = process.env.NODE_ENV === "production";

export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getAdminSessionFromRequest(request: NextRequest): Promise<AdminSessionPayload | null> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}
