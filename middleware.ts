import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me"
);

// Entirely separate secret/cookie from the mother/midwife/doctor sessions
// above — the Super Admin portal has no User row and its own auth system.
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.SUPER_ADMIN_JWT_SECRET ?? "dev-admin-secret-change-me"
);

const ROLE_PREFIXES: Record<string, string> = {
  "/mother": "MOTHER",
  "/midwife": "MIDWIFE",
  "/doctor": "DOCTOR",
};

const AUTH_RATE_LIMIT_PATHS = [
  "/api/auth/login",
  "/api/auth/otp/send",
  "/api/auth/otp/verify",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/admin/auth/login",
  "/api/admin/auth/recover",
];
const hits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (AUTH_RATE_LIMIT_PATHS.includes(pathname)) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const allowed = checkRateLimit(`${ip}:${pathname}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests, try again shortly." }, { status: 429 });
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && pathname !== "/admin/recover") {
    const adminToken = request.cookies.get("admin_session")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(adminToken, ADMIN_SECRET);
      if (typeof payload.sub !== "string" || !payload.sub) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const protectedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) => pathname.startsWith(prefix));
  if (!protectedPrefix) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
    if (payload.role !== ROLE_PREFIXES[protectedPrefix]) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/mother/:path*",
    "/midwife/:path*",
    "/doctor/:path*",
    "/api/auth/:path*",
    "/admin/:path*",
    "/api/admin/auth/login",
    "/api/admin/auth/recover",
  ],
};
