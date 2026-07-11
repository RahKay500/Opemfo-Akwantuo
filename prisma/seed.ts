import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Case studies (Akosua Mensah, Felicia Asem, Laura, Faustina) are the real
// worked examples from the Ghana MCH Record Book User Guide (GHS/JICA, Sept
// 2021) — same names, ages, gestational weeks, and Hb/BMI figures the
// document itself uses, so seeded data exercises the new MCH fields with
// realistic values instead of arbitrary placeholders.

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

  // ---------------------------------------------------------------------
  // Madam Akosua Mensah — 29, second pregnancy, attending her 3rd ANC visit
  // at 22 weeks. Received Td at ANC1 (11 weeks) and IPTp (SP) at ANC2 (17
  // weeks) per the document's own case study.
  // ---------------------------------------------------------------------
  const motherUser = await prisma.user.create({
    data: {
      name: "Akosua Mensah",
      phone: "+233551234567",
      passwordHash,
      role: "MOTHER",
    },
  });

  const patient = await prisma.patient.create({
    data: {
      name: "Akosua Mensah",
      phone: "+233551234567",
      dateOfBirth: new Date("1996-06-14"), // ~29 years old
      ghanaCardId: "GHA-123456789-0",
      facilityId: chps.id,
      registeredById: midwife.id,
      userId: motherUser.id,
      bloodGroup: "O+",
      gravida: 2,
      para: 1,
      lmp: new Date("2026-01-10"),
      edd: new Date("2026-10-17"),
      emergencyContactName: "Kofi Mensah",
      emergencyContactPhone: "+233551111111",
      emergencyContactRelation: "Husband",
      emergencyTransportPhone: "+233551111112",
      nhisNumber: "NHIS-7051234",
      maritalStatus: "Married",
      educationalLevel: "Secondary",
      occupation: "Trader",
      spouseName: "Kofi Mensah",
      spousePhone: "+233551111111",
      spouseOccupation: "Driver",
      numberOfAbortionsSpontaneous: 0,
      numberOfAbortionsInduced: 0,
      previousPregnancies: [
        {
          dateOfDeliveryOrLoss: "2022-08-15",
          placeOfBirth: "Hospital",
          problemsDuringPregnancy: "None",
          gestationalAgeAtBirth: 39,
          modeOfDelivery: "SVD",
          outcome: "Live Birth",
          complications: "None",
          childSex: "F",
          birthWeightKg: 3.1,
          childPresentHealth: "Good",
        },
      ],
      majorRiskFactors: [],
      medicalHistory: {
        hypertension: false,
        heartDisease: false,
        sickleCellDisease: false,
        diabetes: false,
        epilepsy: false,
        asthma: false,
        allergiesDrugFood: false,
        medicationHistory: false,
        hivInfection: "NEGATIVE",
        previousSurgery: "None",
        other: null,
      },
      socialHistory: { alcohol: false, smoking: false },
      familyHistory: {
        hypertension: false,
        heartDisease: false,
        sickleCellDisease: false,
        diabetes: false,
        multiplePregnancies: false,
        birthDefects: false,
        mentalHealthDisorder: false,
        other: null,
      },
      rhTyping: "Positive",
      hbsAg: "Negative",
      sickling: "Negative",
      g6pd: "No Defect",
      vdrl: "Negative",
      hivStatus: "Negative",
      height: 162,
      weightAtAnc1: 64,
      bmiAtAnc1: 24.4,
      estimatedDesiredWeightAtEdd: "75.5kg-80kg",
      contraceptionUsed: "Implants",
      deliveryDate: null,
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
        urineProt: "NEGATIVE",
        urineSugar: "NEGATIVE",
        oedema: false,
        fetalPresentation: "CEPHALIC",
        fetalDescent: "5/5th",
        ifaSupplied: 28,
        complaints: "None",
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
        urineProt: "NEGATIVE",
        urineSugar: "NEGATIVE",
        oedema: false,
        fetalPresentation: "CEPHALIC",
        fetalDescent: "5/5th",
        ifaSupplied: 28,
        complaints: "None",
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
        urineProt: "TRACE",
        urineSugar: "NEGATIVE",
        oedema: true,
        fetalPresentation: "CEPHALIC",
        fetalDescent: "5/5th",
        ifaSupplied: 28,
        complaints: "Mild swelling of feet",
        observations: "Elevated blood pressure observed, advised rest and follow-up.",
        flagged: true,
        flagReason: "Elevated blood pressure",
        flagPriority: "HIGH",
        createdAt: weeksAgo(2),
      },
      {
        // 3rd ANC visit at 22 weeks — matches the case study exactly.
        patientId: patient.id,
        nurseId: midwife.id,
        visitType: "ANTENATAL",
        gestationalAge: 22,
        systolic: 118,
        diastolic: 76,
        fetalHeartRate: 142,
        temperature: 36.8,
        weight: 68.5,
        fundalHeight: 22,
        urineProt: "NEGATIVE",
        urineSugar: "NEGATIVE",
        oedema: false,
        fetalPresentation: "CEPHALIC",
        fetalDescent: "5/5th",
        ifaSupplied: 28,
        complaints: "None",
        observations: "Blood pressure back to normal range. 3rd ANC visit.",
        flagged: false,
        createdAt: new Date(),
      },
    ],
  });

  await prisma.vaccination.create({
    data: {
      patientId: patient.id,
      type: "TD",
      doseNumber: 1,
      dateGiven: new Date(Date.now() - 11 * 7 * 24 * 60 * 60 * 1000),
      batchNumber: "AB1234523",
      gestationalAge: 11,
    },
  });

  await prisma.iptpDose.create({
    data: {
      patientId: patient.id,
      doseNumber: 1,
      dateGiven: new Date(Date.now() - 17 * 7 * 24 * 60 * 60 * 1000),
      gestationalAge: 17,
    },
  });

  await prisma.labResult.create({
    data: {
      patientId: patient.id,
      testType: "Hemoglobin (Hb)",
      dateGiven: weeksAgo(6),
      result: "12.2 g/dl",
      isAbnormal: false,
    },
  });

  const daysAgo = (n: number, hour = 10, minute = 32) => {
    const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const hoursAgoDate = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

  // ---------------------------------------------------------------------
  // Three more mothers, each a nutrition/BMI case study from the document.
  // ---------------------------------------------------------------------
  const otherMothers = [
    {
      // Madam Felicia Asem — 9 weeks, first ANC visit, Hb 9.6 g/dl (moderate
      // anaemia), poor diet (boiled plantain + pepper, once a day). Visit 2
      // a month later shows improved intake.
      name: "Felicia Asem",
      phone: "+233551234568",
      dateOfBirth: new Date("1994-03-02"),
      lmp: new Date("2025-12-05"),
      gravida: 1,
      para: 0,
      hbFirstVisit: "9.6 g/dl",
      visit1: {
        gestationalAge: 9,
        systolic: 112,
        diastolic: 70,
        weight: 58,
        complaints: "Eats once a day (boiled plantain with pepper), poor appetite",
        flagReason: "Moderate anaemia (Hb 9.6 g/dl)",
        flagPriority: "MEDIUM" as const,
      },
      visit2: {
        gestationalAge: 13,
        systolic: 114,
        diastolic: 72,
        weight: 59.5,
        complaints: "Now eating twice a day, improved appetite",
      },
      todayTime: "10:30 AM",
    },
    {
      // Laura — 10 weeks, Hb 10.1 g/dl, tired and weak, drinking soft drinks
      // due to nausea. Visit 2 a month later shows Hb improving to 10.5 g/dl.
      name: "Laura",
      phone: "+233551234569",
      dateOfBirth: new Date("1999-09-18"),
      lmp: new Date("2025-11-28"),
      gravida: 1,
      para: 0,
      hbFirstVisit: "10.1 g/dl",
      visit1: {
        gestationalAge: 10,
        systolic: 108,
        diastolic: 68,
        weight: 54,
        complaints: "Drinks soft drinks, has nausea, feels tired and weak",
        flagReason: "Mild anaemia (Hb 10.1 g/dl), reported fatigue",
        flagPriority: "MEDIUM" as const,
      },
      visit2: {
        gestationalAge: 14,
        systolic: 110,
        diastolic: 70,
        weight: 55.5,
        complaints: "Feels less tired, still occasional nausea",
      },
      todayTime: "11:00 AM",
    },
    {
      // Faustina — 11 weeks, the document's own worked BMI example: 55kg /
      // 167cm -> BMI 19.7 -> estimated desired weight at EDD 66.5-71kg.
      name: "Faustina",
      phone: "+233551234570",
      dateOfBirth: new Date("1997-11-15"),
      lmp: new Date("2025-12-20"),
      gravida: 1,
      para: 0,
      height: 167,
      weightAtAnc1: 55,
      bmiAtAnc1: 19.7,
      estimatedDesiredWeightAtEdd: "66.5kg-71kg",
      visit1: {
        gestationalAge: 11,
        systolic: 116,
        diastolic: 74,
        weight: 55,
        complaints: "None",
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
        gravida: m.gravida,
        para: m.para,
        lmp: m.lmp,
        edd: new Date(m.lmp.getTime() + 280 * 24 * 60 * 60 * 1000),
        height: "height" in m ? m.height : undefined,
        weightAtAnc1: "weightAtAnc1" in m ? m.weightAtAnc1 : undefined,
        bmiAtAnc1: "bmiAtAnc1" in m ? m.bmiAtAnc1 : undefined,
        estimatedDesiredWeightAtEdd: "estimatedDesiredWeightAtEdd" in m ? m.estimatedDesiredWeightAtEdd : undefined,
        medicalHistory: "hbFirstVisit" in m ? { hivInfection: "NEGATIVE", previousSurgery: "None" } : undefined,
        socialHistory: { alcohol: false, smoking: false },
      },
    });

    await prisma.visit.create({
      data: {
        patientId: mPatient.id,
        nurseId: midwife.id,
        visitType: "ANTENATAL",
        gestationalAge: m.visit1.gestationalAge,
        systolic: m.visit1.systolic,
        diastolic: m.visit1.diastolic,
        weight: m.visit1.weight,
        complaints: m.visit1.complaints,
        urineProt: "NEGATIVE",
        urineSugar: "NEGATIVE",
        oedema: false,
        fetalPresentation: null,
        flagged: "flagReason" in m.visit1,
        flagReason: "flagReason" in m.visit1 ? m.visit1.flagReason : undefined,
        flagPriority: "flagPriority" in m.visit1 ? m.visit1.flagPriority : undefined,
        createdAt: daysAgo(30),
      },
    });

    if ("visit2" in m && m.visit2) {
      await prisma.visit.create({
        data: {
          patientId: mPatient.id,
          nurseId: midwife.id,
          visitType: "ANTENATAL",
          gestationalAge: m.visit2.gestationalAge,
          systolic: m.visit2.systolic,
          diastolic: m.visit2.diastolic,
          weight: m.visit2.weight,
          complaints: m.visit2.complaints,
          urineProt: "NEGATIVE",
          urineSugar: "NEGATIVE",
          oedema: false,
          flagged: false,
          createdAt: hoursAgoDate(m.name === "Felicia Asem" ? 2 : 4),
        },
      });
    }

    if (m.hbFirstVisit) {
      await prisma.labResult.create({
        data: {
          patientId: mPatient.id,
          testType: "Hemoglobin (Hb)",
          dateGiven: daysAgo(30),
          result: m.hbFirstVisit,
          isAbnormal: true,
        },
      });
    }

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

  // ---------------------------------------------------------------------
  // A delivered patient, to exercise DeliveryRecord + PostnatalVisit end to
  // end — a separate mother rather than Akosua Mensah, who is still
  // pregnant per her own case study (22 weeks).
  // ---------------------------------------------------------------------
  const deliveredMotherUser = await prisma.user.create({
    data: {
      name: "Abena Owusu",
      phone: "+233551234571",
      passwordHash,
      role: "MOTHER",
    },
  });

  const deliveredPatient = await prisma.patient.create({
    data: {
      name: "Abena Owusu",
      phone: "+233551234571",
      dateOfBirth: new Date("1993-05-20"),
      facilityId: chps.id,
      registeredById: midwife.id,
      userId: deliveredMotherUser.id,
      gravida: 2,
      para: 2,
      lmp: new Date("2025-03-01"),
      edd: new Date("2025-12-05"),
      deliveryDate: new Date("2025-12-03"),
    },
  });

  await prisma.deliveryRecord.create({
    data: {
      patientId: deliveredPatient.id,
      recordedById: midwife.id,
      weeksOfPregnancy: 39,
      dateOfDelivery: new Date("2025-12-03"),
      timeOfDelivery: "06:45 am",
      timeOfPlacentaDelivery: "07:00 am",
      durationOfLabourHours: 6,
      durationOfLabourMinutes: 20,
      typeOfDelivery: "Normal",
      anesthesia: "No",
      estimatedBloodLossMl: 200,
      bloodTransfusion: false,
      statePlacentaMembranes: "Complete",
      manualRemovalOfPlacenta: false,
      statePerineum: "Episiotomy",
      birthAttendant: "Midwife",
      placeOfDelivery: "Hospital",
      breastfedWithin30Min: true,
      skinToSkinContact: true,
      babySex: "F",
      babyBirthWeightKg: 3.2,
      babyCondition: "Good",
    },
  });

  await prisma.postnatalVisit.create({
    data: {
      patientId: deliveredPatient.id,
      nurseId: midwife.id,
      visitType: "PNC1",
      dateOfVisit: new Date("2025-12-04"),
      weight: 68,
      systolic: 118,
      diastolic: 76,
      pulse: 78,
      temperature: 36.7,
      urineProt: "NEGATIVE",
      urineSugar: "NEGATIVE",
      fundalHeight: 18,
      lochiaColour: "Rubra",
      lochiaOdour: "Not offensive",
      incisionPerineumCs: "Clean",
      conditionOfBreastNipple: "Lactating, no issues",
      moodChanges: "None",
      ifaSupplied: 7,
      complaints: "None",
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
