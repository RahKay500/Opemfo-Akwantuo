import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  prisma: {
    labRequest: { findUnique: vi.fn(), update: vi.fn() },
    user: { findMany: vi.fn() },
    referralShare: { findMany: vi.fn() },
    notification: { create: vi.fn(), createMany: vi.fn() },
  },
  getSessionFromRequest: vi.fn(),
  sendLabResultReadySms: vi.fn(),
  logAudit: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/auth", () => ({ getSessionFromRequest: mocks.getSessionFromRequest }));
vi.mock("@/lib/hubtel", () => ({ sendLabResultReadySms: mocks.sendLabResultReadySms, isSmsUnconfigured: () => true }));
vi.mock("@/lib/audit", () => ({ logAudit: mocks.logAudit }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSessionFromRequest.mockResolvedValue({ userId: "tech1", role: "LAB_TECHNICIAN", facilityId: "fac1" });
});

function setup({ requestedById, requestedRole }: { requestedById: string; requestedRole: "MIDWIFE" | "DOCTOR" }) {
  mocks.prisma.labRequest.findUnique.mockResolvedValue({
    id: "lab1",
    patientId: "p1",
    facilityId: "fac1",
    requestedById,
    requestedBy: { role: requestedRole },
    testType: "Hb",
    status: "IN_PROGRESS",
    eta: null,
    result: null,
    isAbnormal: false,
    patient: { id: "p1", name: "Ama", phone: "+233241111111", facilityId: "fac1", userId: null, notifyLabResults: false },
  });
  mocks.prisma.labRequest.update.mockResolvedValue({ id: "lab1" });
}

async function postReady() {
  const { PATCH } = await import("@/app/api/lab-requests/[id]/route");
  return PATCH(
    new NextRequest("http://localhost/api/lab-requests/lab1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "READY", result: "Hb 11.2 g/dL", isAbnormal: false }),
    }),
    { params: { id: "lab1" } }
  );
}

function recipientsOf(call: unknown[]): string[] {
  return ((call[0] as { data: { userId: string }[] }).data).map((n) => n.userId).sort();
}

describe("lab result notifications", () => {
  it("tells the other midwives at the facility and the doctors with an active share when a midwife requested it", async () => {
    setup({ requestedById: "mw1", requestedRole: "MIDWIFE" });
    mocks.prisma.user.findMany.mockResolvedValue([{ id: "mw1" }, { id: "mw2" }]);
    mocks.prisma.referralShare.findMany.mockResolvedValue([{ sharedWithDoctorId: "doc1" }]);

    const res = await postReady();

    expect(res.status).toBe(200);
    expect(recipientsOf(mocks.prisma.notification.createMany.mock.calls[0])).toEqual(["doc1", "mw2"]);
  });

  it("tells the facility's midwives when a doctor requested it, and leaves out the doctor who requested it", async () => {
    setup({ requestedById: "doc1", requestedRole: "DOCTOR" });
    mocks.prisma.user.findMany.mockResolvedValue([{ id: "mw1" }]);
    mocks.prisma.referralShare.findMany.mockResolvedValue([{ sharedWithDoctorId: "doc1" }, { sharedWithDoctorId: "doc2" }]);

    await postReady();

    expect(recipientsOf(mocks.prisma.notification.createMany.mock.calls[0])).toEqual(["doc2", "mw1"]);
  });

  it("only counts shares that are still active and unexpired", async () => {
    setup({ requestedById: "mw1", requestedRole: "MIDWIFE" });
    mocks.prisma.user.findMany.mockResolvedValue([]);
    mocks.prisma.referralShare.findMany.mockResolvedValue([]);

    await postReady();

    const where = mocks.prisma.referralShare.findMany.mock.calls[0][0].where;
    expect(where).toMatchObject({ patientId: "p1", isActive: true });
    expect(where.expiresAt.gt).toBeInstanceOf(Date);
  });
});
