import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest, NextResponse } from "next/server";

// Entirely separate from lib/auth.ts (mother/midwife/doctor sessions): its
// own secret, its own cookie, its own token shape. The Super Admin is not a
// User row — it authenticates purely against env credentials — so nothing
// here should ever touch the `access_token`/`refresh_token` cookies or the
// JWT_ACCESS_SECRET used by the rest of the app.
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.SUPER_ADMIN_JWT_SECRET ?? "dev-admin-secret-change-me"
);

export const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_EXPIRY = "8h";
const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

export interface AdminSessionPayload {
  sub: "super-admin";
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ sub: "super-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_SESSION_EXPIRY)
    .sign(ADMIN_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload> {
  const { payload } = await jwtVerify(token, ADMIN_SECRET);
  if (payload.sub !== "super-admin") {
    throw new Error("Invalid admin token");
  }
  return payload as unknown as AdminSessionPayload;
}

export async function checkAdminCredentials(phone: string, password: string): Promise<boolean> {
  const expectedPhone = process.env.SUPER_ADMIN_PHONE;
  const passwordHash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (!expectedPhone || !passwordHash) return false;
  if (phone !== expectedPhone) return false;
  return bcrypt.compare(password, passwordHash);
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
