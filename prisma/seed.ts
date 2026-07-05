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
      phone: "+233352091234",
    },
  });

  const hospital = await prisma.facility.create({
    data: {
      name: "Kintampo Municipal Hospital",
      type: "DISTRICT_HOSPITAL",
      region: "Bono East",
      district: "Kintampo North Municipal",
      phone: "+233352092345",
    },
  });

  const korleBu = await prisma.facility.create({
    data: {
      name: "Korle Bu Teaching Hospital",
      type: "TEACHING_HOSPITAL",
      region: "Greater Accra",
      district: "Korle Klottey",
      phone: "+233302501234",
    },
  });

  const temaGeneral = await prisma.facility.create({
    data: {
      name: "Tema General Hospital",
      type: "DISTRICT_HOSPITAL",
      region: "Greater Accra",
      district: "Tema Metropolitan",
      phone: "+233303202345",
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

  const weeksAgo = (n: number) => new Date(Date.now() - n * 7 * 24 * 60 * 60 * 1000);

  await prisma.visit.createMany({
    data: [
      {
        patientId: patient.id,
        nurseId: midwife.id,
        visitType: "ANTENATAL",
        gestationalAge: 19,
        systolic: 116,
        diastolic: 74,
        fetalHeartRate: 138,
        temperature: 36.7,
        weight: 66.2,
        fundalHeight: 19,
        observations: "Routine antenatal visit, no concerns.",
        flagged: false,
        createdAt: weeksAgo(6),
      },
      {
        patientId: patient.id,
        nurseId: midwife.id,
        visitType: "ANTENATAL",
        gestationalAge: 21,
        systolic: 122,
        diastolic: 78,
        fetalHeartRate: 140,
        temperature: 36.6,
        weight: 67.1,
        fundalHeight: 21,
        observations: "Routine antenatal visit, no concerns.",
        flagged: false,
        createdAt: weeksAgo(4),
      },
      {
        patientId: patient.id,
        nurseId: midwife.id,
        visitType: "ANTENATAL",
        gestationalAge: 23,
        systolic: 138,
        diastolic: 88,
        fetalHeartRate: 145,
        temperature: 36.9,
        weight: 67.8,
        fundalHeight: 23,
        observations: "Elevated blood pressure observed, advised rest and follow-up.",
        flagged: true,
        flagReason: "Elevated blood pressure",
        flagPriority: "HIGH",
        createdAt: weeksAgo(2),
      },
      {
        patientId: patient.id,
        nurseId: midwife.id,
        visitType: "ANTENATAL",
        gestationalAge: 25,
        systolic: 118,
        diastolic: 76,
        fetalHeartRate: 142,
        temperature: 36.8,
        weight: 68.5,
        fundalHeight: 25,
        observations: "Blood pressure back to normal range.",
        flagged: false,
        createdAt: new Date(),
      },
    ],
  });

  const daysAgo = (n: number, hour = 10, minute = 32) => {
    const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const hoursAgoDate = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

  const otherMothers = [
    {
      name: "Adwoa Asante",
      phone: "+233551234568",
      dateOfBirth: new Date("1995-02-20"),
      lmp: new Date("2025-11-30"),
      visit: {
        gestationalAge: 34,
        systolic: 165,
        diastolic: 112,
        fetalHeartRate: 148,
        temperature: 37.1,
        flagReason: "Systolic BP 165 mmHg (critical ≥ 160); Diastolic BP 112 mmHg (critical ≥ 110)",
        flagPriority: "CRITICAL" as const,
        hoursAgo: 2,
      },
      todayTime: "10:30 AM",
    },
    {
      name: "Ama Owusu",
      phone: "+233551234569",
      dateOfBirth: new Date("1999-07-08"),
      lmp: new Date("2025-12-20"),
      visit: {
        gestationalAge: 28,
        systolic: 148,
        diastolic: 95,
        fetalHeartRate: 150,
        temperature: 36.9,
        flagReason: "Systolic BP 148 mmHg (high ≥ 140); Diastolic BP 95 mmHg (high ≥ 90)",
        flagPriority: "HIGH" as const,
        hoursAgo: 4,
      },
      todayTime: "11:00 AM",
    },
    {
      name: "Efua Darkwa",
      phone: "+233551234570",
      dateOfBirth: new Date("1997-11-15"),
      lmp: new Date("2025-09-15"),
      visit: {
        gestationalAge: 20,
        systolic: 118,
        diastolic: 76,
        fetalHeartRate: 140,
        temperature: 36.7,
        flagReason: "Borderline fundal height for gestational age",
        flagPriority: "MEDIUM" as const,
        hoursAgo: 6,
      },
      todayTime: "12:00 PM",
    },
  ];

  for (const m of otherMothers) {
    const mUser = await prisma.user.create({
      data: { name: m.name, phone: m.phone, passwordHash, role: "MOTHER" },
    });
    const mPatient = await prisma.patient.create({
      data: {
        name: m.name,
        phone: m.phone,
        dateOfBirth: m.dateOfBirth,
        facilityId: chps.id,
        registeredById: midwife.id,
        userId: mUser.id,
        gravida: 1,
        para: 0,
        lmp: m.lmp,
        edd: new Date(m.lmp.getTime() + 280 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.visit.create({
      data: {
        patientId: mPatient.id,
        nurseId: midwife.id,
        visitType: "ANTENATAL",
        gestationalAge: m.visit.gestationalAge,
        systolic: m.visit.systolic,
        diastolic: m.visit.diastolic,
        fetalHeartRate: m.visit.fetalHeartRate,
        temperature: m.visit.temperature,
        flagged: true,
        flagReason: m.visit.flagReason,
        flagPriority: m.visit.flagPriority,
        createdAt: hoursAgoDate(m.visit.hoursAgo),
      },
    });
    await prisma.appointmentRequest.create({
      data: {
        patientId: mPatient.id,
        requestType: "ROUTINE",
        preferredDate: new Date(),
        preferredTime: m.todayTime,
        status: "CONFIRMED",
      },
    });
  }

  const activeReferral = await prisma.referral.create({
    data: {
      patientId: patient.id,
      fromFacilityId: chps.id,
      toFacilityId: korleBu.id,
      initiatedById: midwife.id,
      priority: "CRITICAL",
      systemSuggestedPriority: "CRITICAL",
      reason: "Suspected pre-eclampsia — elevated BP with proteinuria risk",
      transportMethod: "Ambulance",
      status: "ACKNOWLEDGED",
      sentAt: daysAgo(2, 10, 32),
      acknowledgedAt: daysAgo(2, 10, 45),
    },
  });

  await prisma.referral.create({
    data: {
      patientId: patient.id,
      fromFacilityId: chps.id,
      toFacilityId: temaGeneral.id,
      initiatedById: midwife.id,
      priority: "MEDIUM",
      systemSuggestedPriority: "MEDIUM",
      reason: "Routine specialist antenatal review",
      transportMethod: "Private vehicle",
      status: "COMPLETED",
      sentAt: new Date("2025-03-08T09:00:00"),
      acknowledgedAt: new Date("2025-03-08T09:15:00"),
      arrivedAt: new Date("2025-03-08T11:00:00"),
      completedAt: new Date("2025-03-08T13:30:00"),
      outcomeNotes: "Reviewed and discharged back to CHPS care.",
    },
  });

  const flaggedVisit = await prisma.visit.findFirst({ where: { patientId: patient.id, flagged: true } });

  const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

  await prisma.notification.createMany({
    data: [
      {
        userId: motherUser.id,
        type: "REFERRAL",
        title: "Your referral to Korle Bu Teaching Hospital has been acknowledged",
        message: "The hospital is ready for your arrival. Please proceed when ready.",
        isRead: false,
        relatedId: activeReferral.id,
        relatedType: "Referral",
        createdAt: hoursAgo(2),
      },
      {
        userId: motherUser.id,
        type: "APPOINTMENT",
        title: "Appointment confirmed for 18 June",
        message: "Your antenatal visit at Kintampo CHPS Compound is confirmed for 10:30 AM.",
        isRead: true,
        createdAt: daysAgo(2, 8, 0),
      },
      {
        userId: motherUser.id,
        type: "VITALS",
        title: "High blood pressure",
        message: "Your blood pressure at the last visit was slightly elevated. Your midwife will review.",
        isRead: false,
        relatedId: flaggedVisit?.id,
        relatedType: "Visit",
        createdAt: daysAgo(2, 9, 15),
      },
    ],
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
