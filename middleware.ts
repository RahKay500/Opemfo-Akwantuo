import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me"
);
// Duplicated from lib/auth.ts rather than imported — that module also pulls
// in bcryptjs (password hashing), which isn't guaranteed edge-runtime safe,
// and middleware.ts already keeps its own copy of ACCESS_SECRET for the same
// reason. Same value as lib/auth.ts's REFRESH_SECRET/ACCESS_TOKEN_EXPIRY.
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me"
);
const ACCESS_TOKEN_EXPIRY = "15m";

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
  "/api/admin/auth/activate/request",
  "/api/admin/auth/activate/confirm",
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

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/recover" &&
    pathname !== "/admin/activate"
  ) {
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
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
      if (payload.role !== ROLE_PREFIXES[protectedPrefix]) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    } catch {
      // Falls through to the refresh-token attempt below — a plain expiry
      // (the access token only lives 15 minutes) shouldn't force a full
      // re-login when a valid 30-day refresh token is sitting right there.
    }
  }

  // No valid access token — try a silent refresh before giving up. Without
  // this, every session died the moment the 15-minute access token expired,
  // even with a perfectly valid refresh token present, forcing a re-login on
  // whatever click happened to come next.
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
    if (payload.role !== ROLE_PREFIXES[protectedPrefix]) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const newAccessToken = await new SignJWT({
      userId: payload.userId,
      role: payload.role,
      facilityId: payload.facilityId ?? null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(ACCESS_SECRET);

    const response = NextResponse.next();
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
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
    "/api/admin/auth/activate/request",
    "/api/admin/auth/activate/confirm",
  ],
};
