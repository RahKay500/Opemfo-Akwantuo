import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SignJWT } from "jose";
import {
  jwtSecret,
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret-0123456789";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-0123456789";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

const payload = { userId: "user_1", role: "MIDWIFE" as const, facilityId: "fac_1" };

describe("access tokens", () => {
  it("round-trips the user's id, role and facility", async () => {
    const token = await signAccessToken(payload);
    await expect(verifyAccessToken(token)).resolves.toMatchObject(payload);
  });

  it("rejects a token signed with a different secret", async () => {
    const forged = await new SignJWT({ ...payload, role: "DOCTOR" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode("attacker-secret"));
    await expect(verifyAccessToken(forged)).rejects.toThrow();
  });

  it("rejects a refresh token presented as an access token", async () => {
    const refresh = await signRefreshToken(payload);
    await expect(verifyAccessToken(refresh)).rejects.toThrow();
  });

  it("rejects an access token presented as a refresh token", async () => {
    const access = await signAccessToken(payload);
    await expect(verifyRefreshToken(access)).rejects.toThrow();
  });
});

describe("jwtSecret", () => {
  it("uses the configured env value when present", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JWT_ACCESS_SECRET", "real-secret");
    expect(new TextDecoder().decode(jwtSecret("JWT_ACCESS_SECRET", "dev"))).toBe("real-secret");
  });

  it("fails closed in production when the secret is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JWT_ACCESS_SECRET", "");
    expect(() => jwtSecret("JWT_ACCESS_SECRET", "dev-fallback")).toThrow(/must be set in production/);
  });

  it("falls back to the dev default outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("JWT_ACCESS_SECRET", "");
    expect(new TextDecoder().decode(jwtSecret("JWT_ACCESS_SECRET", "dev-fallback"))).toBe("dev-fallback");
  });
});
