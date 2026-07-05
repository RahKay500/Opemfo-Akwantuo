import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress, calculateAge } from "@/lib/pregnancy";

export interface MotherProfileData {
  patientId: string;
  displayId: string;
  name: string;
  phone: string;
  dateOfBirth: Date;
  age: number;
  ghanaCardId: string | null;
  bloodGroup: string | null;
  knownConditions: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  currentWeek: number;
  visitsCount: number;
}

export async function getMotherProfileData(userId: string): Promise<MotherProfileData | null> {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const visitsCount = await prisma.visit.count({ where: { patientId: patient.id } });

  return {
    patientId: patient.id,
    displayId: `OPM-${patient.id.slice(-6).toUpperCase()}`,
    name: patient.name,
    phone: patient.phone,
    dateOfBirth: patient.dateOfBirth,
    age: calculateAge(patient.dateOfBirth),
    ghanaCardId: patient.ghanaCardId,
    bloodGroup: patient.bloodGroup,
    knownConditions: patient.knownConditions,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    emergencyContactRelation: patient.emergencyContactRelation,
    currentWeek: patient.lmp ? calculatePregnancyProgress(patient.lmp).week : 0,
    visitsCount,
  };
}
