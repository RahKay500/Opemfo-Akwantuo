import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const { prisma, getSessionFromRequest, getAdminSessionFromRequest, getVisibleFacilityIds, logAudit } = vi.hoisted(() => ({
  prisma: {
    patient: { findUnique: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn(), findMany: vi.fn() },
    facility: { findMany: vi.fn() },
  },
  getSessionFromRequest: vi.fn(),
  getAdminSessionFromRequest: vi.fn(),
  getVisibleFacilityIds: vi.fn(),
  logAudit: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth")>()),
  getSessionFromRequest,
}));
vi.mock("@/lib/admin-auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/admin-auth")>()),
  getAdminSessionFromRequest,
}));
vi.mock("@/lib/current-admin", () => ({ getVisibleFacilityIds }));
vi.mock("@/lib/audit", () => ({ logAudit }));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SUPER_ADMIN_JWT_SECRET = "test-admin-secret-0123456789";
});

const req = (url: string, init?: ConstructorParameters<typeof NextRequest>[1]) => new NextRequest(url, init);

describe("patient record access", () => {
  it("refuses a request with no session", async () => {
    getSessionFromRequest.mockResolvedValue(null);
    const { GET } = await import("@/app/api/patients/[id]/route");

    const res = await GET(req("http://localhost/api/patients/p1"), { params: Promise.resolve({ id: "p1" }) });

    expect(res.status).toBe(401);
  });

  it("returns 404 for a patient at another facility, without revealing she exists", async () => {
    getSessionFromRequest.mockResolvedValue({ userId: "u1", role: "MIDWIFE", facilityId: "fac-A" });
    prisma.patient.findUnique.mockResolvedValue({ id: "p1", facilityId: "fac-B", name: "Ama" });
    const { GET } = await import("@/app/api/patients/[id]/route");

    const res = await GET(req("http://localhost/api/patients/p1"), { params: Promise.resolve({ id: "p1" }) });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Patient not found." });
  });

  it("returns the patient to a midwife at the same facility", async () => {
    getSessionFromRequest.mockResolvedValue({ userId: "u1", role: "MIDWIFE", facilityId: "fac-A" });
    prisma.patient.findUnique.mockResolvedValue({ id: "p1", facilityId: "fac-A", name: "Ama" });
    const { GET } = await import("@/app/api/patients/[id]/route");

    const res = await GET(req("http://localhost/api/patients/p1"), { params: Promise.resolve({ id: "p1" }) });

    expect(res.status).toBe(200);
  });
});

describe("login attempt limits", () => {
  it("blocks further attempts on one account before looking up the user", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const { POST } = await import("@/app/api/auth/login/route");
    const identifier = `0241${Math.floor(100000 + Math.random() * 899999)}`;
    const attempt = () =>
      POST(
        req("http://localhost/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250)}` },
          body: JSON.stringify({ identifier, password: "WrongPassword1" }),
        })
      );

    for (let i = 0; i < 10; i++) await attempt();
    prisma.user.findUnique.mockClear();
    const blocked = await attempt();

    expect(blocked.status).toBe(429);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("answers an unknown account with the same message as a wrong password", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const { POST } = await import("@/app/api/auth/login/route");

    const res = await POST(
      req("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250)}` },
        body: JSON.stringify({ identifier: `0244${Math.floor(100000 + Math.random() * 899999)}`, password: "WrongPassword1" }),
      })
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Invalid phone/email or password." });
  });
});

describe("admin search scope", () => {
  it("never returns patients, even when the search matches one", async () => {
    getAdminSessionFromRequest.mockResolvedValue({ sub: "a1", facilityId: "fac-A", districtId: null, regionId: null });
    getVisibleFacilityIds.mockResolvedValue(["fac-A"]);
    prisma.user.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/admin/search/route");

    const res = await GET(req("http://localhost/api/admin/search?q=Ama"));
    const body = await res.json();

    expect(body.data).not.toHaveProperty("patients");
    expect(prisma.patient.findMany).not.toHaveBeenCalled();
  });

  it("limits staff results to the admin's own facility", async () => {
    getAdminSessionFromRequest.mockResolvedValue({ sub: "a1", facilityId: "fac-A", districtId: null, regionId: null });
    getVisibleFacilityIds.mockResolvedValue(["fac-A"]);
    prisma.user.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/admin/search/route");

    await GET(req("http://localhost/api/admin/search?q=Kofi"));

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ facilityId: { in: ["fac-A"] } }) })
    );
  });
});
