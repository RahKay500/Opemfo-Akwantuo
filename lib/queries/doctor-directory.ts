import { prisma } from "@/lib/prisma";

export interface DoctorDirectoryEntry {
  id: string;
  name: string;
  facilityName: string;
}

// The picker Forward uses to pick a recipient — every other doctor account,
// regardless of facility (a share is already a deliberately cross-facility
// grant, so forwarding isn't scoped to "doctors at my hospital").
export async function getOtherDoctors(excludingUserId: string): Promise<DoctorDirectoryEntry[]> {
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR", id: { not: excludingUserId } },
    include: { facility: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return doctors.map((d) => ({
    id: d.id,
    name: d.name,
    facilityName: d.facility?.name ?? "",
  }));
}
