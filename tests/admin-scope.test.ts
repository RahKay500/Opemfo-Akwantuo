import { describe, it, expect, beforeEach, vi } from "vitest";
import { signAccessToken } from "@/lib/auth";
import { isPlatformAdmin, signAdminToken, verifyAdminToken } from "@/lib/admin-auth";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

beforeEach(() => {
  process.env.SUPER_ADMIN_JWT_SECRET = "test-admin-secret-0123456789";
});

describe("isPlatformAdmin", () => {
  it("is true only when no region, district or facility scope is set", () => {
    expect(isPlatformAdmin({ facilityId: null, districtId: null, regionId: null })).toBe(true);
  });

  it("is false for a Regional Admin, even though facilityId is null", () => {
    expect(isPlatformAdmin({ facilityId: null, districtId: null, regionId: "reg_1" })).toBe(false);
  });

  it("is false for a District Admin, even though facilityId is null", () => {
    expect(isPlatformAdmin({ facilityId: null, districtId: "dist_1", regionId: null })).toBe(false);
  });

  it("is false for a Facility Admin", () => {
    expect(isPlatformAdmin({ facilityId: "fac_1", districtId: null, regionId: null })).toBe(false);
  });
});

describe("admin session tokens", () => {
  it("round-trips the admin's scope", async () => {
    const scope = { facilityId: "fac_1", districtId: null, regionId: null };
    const token = await signAdminToken("admin_1", scope);
    await expect(verifyAdminToken(token)).resolves.toMatchObject({ sub: "admin_1", ...scope });
  });

  it("rejects a staff access token used as an admin session", async () => {
    const staffToken = await signAccessToken({ userId: "u1", role: "MIDWIFE", facilityId: "fac_1" });
    await expect(verifyAdminToken(staffToken)).rejects.toThrow();
  });
});
