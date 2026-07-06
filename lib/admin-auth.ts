import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await prisma.superAdmin.findUnique({ where: { id: adminId } });
  if (!admin) return { success: false, error: "Account not found." };

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.superAdmin.update({ where: { id: adminId }, data: { passwordHash } });
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
