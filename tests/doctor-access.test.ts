import { describe, it, expect, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  referralShare: { findFirst: vi.fn().mockResolvedValue(null) },
  patient: { findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

describe("doctor access to a shared record", () => {
  it("only finds shares that are active and not yet expired", async () => {
    const { getDoctorPatientDetail } = await import("@/lib/queries/doctor-patient-detail");

    const detail = await getDoctorPatientDetail("p1", "doc1");

    expect(detail).toBeNull();
    const where = prisma.referralShare.findFirst.mock.calls[0][0].where;
    expect(where).toMatchObject({ patientId: "p1", sharedWithDoctorId: "doc1", isActive: true });
    expect(where.expiresAt.gt).toBeInstanceOf(Date);
  });
});
