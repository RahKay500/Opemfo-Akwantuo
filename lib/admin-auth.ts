import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";
import { sendOtpSms } from "@/lib/hubtel";
import { normalizeGhanaPhone } from "@/lib/utils";

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
  facilityId: string | null; // null = Platform Super Admin; set = Facility Admin
}

export async function signAdminToken(adminId: string, facilityId: string | null): Promise<string> {
  return new SignJWT({ sub: adminId, facilityId })
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
  if (payload.facilityId !== null && typeof payload.facilityId !== "string") {
    throw new Error("Invalid admin token");
  }
  return payload as unknown as AdminSessionPayload;
}

// Runs on every login attempt (cheap — a single indexed count query). The
// very first time this app talks to a fresh database, the SuperAdmin table
// is empty, so this seeds exactly one Platform Super Admin row from the
// bootstrap env vars and never touches them again afterwards. Updating
// SUPER_ADMIN_EMAIL/PASSWORD later has no effect once that row exists —
// password changes from then on go through requestPasswordChange, not env vars.
async function ensureSuperAdminBootstrapped(): Promise<void> {
  const count = await prisma.superAdmin.count();
  if (count > 0) return;

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.superAdmin.create({
    data: { email: email.toLowerCase(), passwordHash, facilityId: null, isActive: true },
  });
}

// The admin login form takes a single "identifier" field shared by both
// tiers: the Platform Super Admin (facilityId: null) signs in with their
// company email, Facility Admins sign in with the phone number they
// activated with. An "@" in the input picks the branch.
export async function checkAdminCredentials(
  identifier: string,
  password: string
): Promise<{ id: string; facilityId: string | null } | null> {
  await ensureSuperAdminBootstrapped();

  const admin = identifier.includes("@")
    ? await prisma.superAdmin.findUnique({ where: { email: identifier.trim().toLowerCase() } })
    : await (async () => {
        const phone = normalizeGhanaPhone(identifier);
        return phone ? prisma.superAdmin.findUnique({ where: { phone } }) : null;
      })();

  if (!admin || !admin.isActive || !admin.passwordHash) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  await prisma.superAdmin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  return { id: admin.id, facilityId: admin.facilityId };
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
): Promise<{ success: boolean; error?: string; phone?: string | null; otp?: string }> {
  const admin = await prisma.superAdmin.findUnique({ where: { id: adminId } });
  if (!admin || !admin.passwordHash) return { success: false, error: "Account not found." };

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect." };

  const pendingPasswordHash = await bcrypt.hash(newPassword, 12);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);

  await prisma.superAdmin.update({
    where: { id: adminId },
    data: { pendingPasswordHash, otp, otpExpiry },
  });

  // The Platform Super Admin has no phone (email-based login) — nothing to
  // text, the code is shown on screen instead (see the devOtp handling in
  // the route, which forces that display whenever there's no phone).
  if (admin.phone) await sendOtpSms(admin.phone, otp);
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

// Last-resort recovery for the Platform Super Admin: re-entering the
// original bootstrap env-var credentials resets the database password
// directly, no current-password or OTP required. This is intentional —
// whoever controls the server's env vars is the ultimate owner of this
// account, matching how the SuperAdmin row itself is bootstrapped from those
// same vars in the first place. A session hijacker has no path to this
// without also compromising the server config, which is a different, higher
// trust boundary.
//
// Targets the platform row by facilityId: null rather than matching on the
// submitted email — there's exactly one such row, and this way recovery
// still works even if that row's email doesn't match the env var yet (e.g.
// the very first rollout of email-based login, or an out-of-band change).
//
// An optional newEmail also covers succession: when the person holding this
// role leaves, whoever controls the env vars can hand the account to a
// replacement's email in the same step, rather than being stuck resetting a
// password for an inbox the outgoing admin still controls.
export async function recoverSuperAdminPassword(
  email: string,
  envPassword: string,
  newPassword: string,
  newEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const expectedEmail = process.env.SUPER_ADMIN_EMAIL;
  const expectedPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    return { success: false, error: "Recovery is not configured on this server." };
  }
  if (email.toLowerCase() !== expectedEmail.toLowerCase() || envPassword !== expectedPassword) {
    return { success: false, error: "Invalid recovery credentials." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const targetEmail = (newEmail || email).toLowerCase();
  const existing = await prisma.superAdmin.findFirst({ where: { facilityId: null } });

  if (existing) {
    await prisma.superAdmin.update({
      where: { id: existing.id },
      data: {
        email: targetEmail,
        passwordHash,
        isActive: true,
        pendingPasswordHash: null,
        otp: null,
        otpExpiry: null,
      },
    });
  } else {
    await prisma.superAdmin.create({ data: { email: targetEmail, passwordHash, facilityId: null, isActive: true } });
  }
  return { success: true };
}

// Step 1 of 2 for a newly-created Facility Admin's first activation: finds
// the pending row (created by the Platform Super Admin via
// POST /api/admin/facility-admins — isActive:false, passwordHash:null) and
// sends it a fresh OTP. Mirrors how staff activation works, but scoped to
// SuperAdmin since admins are deliberately never a User row.
export async function requestFacilityAdminActivation(
  phone: string
): Promise<{ success: boolean; error?: string; otp?: string }> {
  const admin = await prisma.superAdmin.findUnique({ where: { phone } });
  if (!admin || admin.isActive || admin.passwordHash) {
    return { success: false, error: "No pending Facility Admin account found for this number." };
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60_000);
  await prisma.superAdmin.update({ where: { id: admin.id }, data: { otp, otpExpiry } });

  await sendOtpSms(phone, otp);
  return { success: true, otp };
}

// Step 2 of 2: verifies the OTP and sets the Facility Admin's own password in
// one submission (no intermediate setup token — this is a fresh, admin-only
// flow, so it doesn't need to mirror the User table's 3-step dance, and
// deliberately doesn't reuse lib/auth.ts's signSetupToken/ACCESS_SECRET,
// which belongs to the separate Mother/Midwife/Doctor auth system).
export async function confirmFacilityAdminActivation(
  phone: string,
  otp: string,
  password: string
): Promise<{ success: boolean; error?: string; id?: string; facilityId?: string | null }> {
  const admin = await prisma.superAdmin.findUnique({ where: { phone } });
  if (!admin || admin.isActive || admin.passwordHash) {
    return { success: false, error: "No pending Facility Admin account found for this number." };
  }
  if (!admin.otp || !admin.otpExpiry || admin.otp !== otp || admin.otpExpiry < new Date()) {
    return { success: false, error: "Invalid or expired code." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.superAdmin.update({
    where: { id: admin.id },
    data: { passwordHash, isActive: true, otp: null, otpExpiry: null },
  });

  return { success: true, id: admin.id, facilityId: admin.facilityId };
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
