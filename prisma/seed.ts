import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const chps = await prisma.facility.create({
    data: {
      name: "Kintampo CHPS Compound",
      type: "CHPS",
      region: "Bono East",
      district: "Kintampo North Municipal",
    },
  });

  const hospital = await prisma.facility.create({
    data: {
      name: "Kintampo Municipal Hospital",
      type: "DISTRICT_HOSPITAL",
      region: "Bono East",
      district: "Kintampo North Municipal",
    },
  });

  const passwordHash = await bcrypt.hash("Password123", 12);

  const midwife = await prisma.user.create({
    data: {
      name: "Efua Mensah",
      phone: "+233241234567",
      passwordHash,
      role: "MIDWIFE",
      facilityId: chps.id,
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: "Dr. Kwame Owusu",
      phone: "+233201234567",
      passwordHash,
      role: "DOCTOR",
      facilityId: hospital.id,
    },
  });

  const motherUser = await prisma.user.create({
    data: {
      name: "Ama Serwaa",
      phone: "+233551234567",
      passwordHash,
      role: "MOTHER",
    },
  });

  const patient = await prisma.patient.create({
    data: {
      name: "Ama Serwaa",
      phone: "+233551234567",
      dateOfBirth: new Date("1998-04-12"),
      ghanaCardId: "GHA-123456789-0",
      facilityId: chps.id,
      registeredById: midwife.id,
      userId: motherUser.id,
      bloodGroup: "O+",
      gravida: 2,
      para: 1,
      lmp: new Date("2026-01-10"),
      edd: new Date("2026-10-17"),
      emergencyContactName: "Kofi Serwaa",
      emergencyContactPhone: "+233551111111",
      emergencyContactRelation: "Husband",
    },
  });

  await prisma.visit.create({
    data: {
      patientId: patient.id,
      nurseId: midwife.id,
      visitType: "ANTENATAL",
      gestationalAge: 24,
      systolic: 118,
      diastolic: 76,
      fetalHeartRate: 142,
      temperature: 36.8,
      weight: 68.5,
      fundalHeight: 24,
      observations: "Routine antenatal visit, no concerns.",
      flagged: false,
    },
  });

  // Left unregistered on purpose — for exercising the OTP send/verify/set-password
  // flow end to end against a fresh phone number.
  console.log("Seed complete. Unregistered test phone for OTP flow: +233559998888");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
