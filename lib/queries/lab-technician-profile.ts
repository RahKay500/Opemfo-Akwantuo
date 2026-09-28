import { prisma } from "@/lib/prisma";

export interface LabTechnicianProfileData {
  name: string;
  phone: string | null;
  facilityName: string;
  facilityRegion: string;
  memberSince: number;
  testsCompletedCount: number;
  testsCompletedThisMonthCount: number;
  pendingInQueueCount: number;
  staffId: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  email: string | null;
  serviceStartDate: Date | null;
  yearsOfService: number | null;
  isVerified: boolean;
}

export async function getLabTechnicianProfileData(userId: string): Promise<LabTechnicianProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { facility: { include: { district: { include: { region: true } } } } },
  });
  if (!user || !user.facilityId || !user.facility) return null;

  const facilityId = user.facilityId;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [testsCompletedCount, testsCompletedThisMonthCount, pendingInQueueCount] = await Promise.all([
    prisma.labRequest.count({ where: { facilityId, completedById: userId, status: "READY" } }),
    prisma.labRequest.count({
      where: { facilityId, completedById: userId, status: "READY", completedAt: { gte: startOfMonth } },
    }),
    prisma.labRequest.count({ where: { facilityId, status: { in: ["REQUESTED", "IN_PROGRESS"] } } }),
  ]);

  const yearsOfService = user.serviceStartDate
    ? Math.max(0, new Date().getFullYear() - user.serviceStartDate.getFullYear())
    : null;

  return {
    name: user.name,
    phone: user.phone,
    facilityName: user.facility.name,
    facilityRegion: user.facility.district.region.name,
    memberSince: user.createdAt.getFullYear(),
    testsCompletedCount,
    testsCompletedThisMonthCount,
    pendingInQueueCount,
    staffId: user.licenseNumber,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    email: user.email,
    serviceStartDate: user.serviceStartDate,
    yearsOfService,
    isVerified: Boolean(user.licenseNumber),
  };
}
