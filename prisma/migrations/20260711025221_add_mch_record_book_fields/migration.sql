-- CreateEnum
CREATE TYPE "UrineTestResult" AS ENUM ('NEGATIVE', 'TRACE', 'PLUS_1', 'PLUS_2', 'PLUS_3');

-- CreateEnum
CREATE TYPE "FetalPresentation" AS ENUM ('CEPHALIC', 'BREECH', 'OTHER');

-- CreateEnum
CREATE TYPE "PostnatalVisitType" AS ENUM ('PNC1', 'PNC2', 'PNC3');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "bmiAtAnc1" DOUBLE PRECISION,
ADD COLUMN     "contraceptionUsed" TEXT,
ADD COLUMN     "educationalLevel" TEXT,
ADD COLUMN     "emergencyTransportPhone" TEXT,
ADD COLUMN     "estimatedDesiredWeightAtEdd" TEXT,
ADD COLUMN     "familyHistory" JSONB,
ADD COLUMN     "g6pd" TEXT,
ADD COLUMN     "hbsAg" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "hivStatus" TEXT,
ADD COLUMN     "majorRiskFactors" TEXT[],
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "medicalHistory" JSONB,
ADD COLUMN     "nhisNumber" TEXT,
ADD COLUMN     "numberOfAbortionsInduced" INTEGER,
ADD COLUMN     "numberOfAbortionsSpontaneous" INTEGER,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "previousPregnancies" JSONB,
ADD COLUMN     "rhTyping" TEXT,
ADD COLUMN     "sickling" TEXT,
ADD COLUMN     "socialHistory" JSONB,
ADD COLUMN     "spouseName" TEXT,
ADD COLUMN     "spouseOccupation" TEXT,
ADD COLUMN     "spousePhone" TEXT,
ADD COLUMN     "vdrl" TEXT,
ADD COLUMN     "weightAtAnc1" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "complaints" TEXT,
ADD COLUMN     "fetalDescent" TEXT,
ADD COLUMN     "fetalPresentation" "FetalPresentation",
ADD COLUMN     "ifaSupplied" INTEGER,
ADD COLUMN     "oedema" BOOLEAN,
ADD COLUMN     "urineProt" "UrineTestResult",
ADD COLUMN     "urineSugar" "UrineTestResult";

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "doseNumber" INTEGER NOT NULL,
    "dateGiven" TIMESTAMP(3) NOT NULL,
    "batchNumber" TEXT,
    "gestationalAge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IptpDose" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doseNumber" INTEGER NOT NULL,
    "dateGiven" TIMESTAMP(3) NOT NULL,
    "gestationalAge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IptpDose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "weeksOfPregnancy" INTEGER,
    "dateOfDelivery" TIMESTAMP(3),
    "timeOfDelivery" TEXT,
    "timeOfPlacentaDelivery" TEXT,
    "durationOfLabourHours" INTEGER,
    "durationOfLabourMinutes" INTEGER,
    "typeOfDelivery" TEXT,
    "indicationForVacuumOrCs" TEXT,
    "anesthesia" TEXT,
    "estimatedBloodLossMl" INTEGER,
    "bloodTransfusion" BOOLEAN,
    "statePlacentaMembranes" TEXT,
    "manualRemovalOfPlacenta" BOOLEAN,
    "statePerineum" TEXT,
    "labourDeliveryComplications" TEXT,
    "birthAttendant" TEXT,
    "placeOfDelivery" TEXT,
    "breastfedWithin30Min" BOOLEAN,
    "skinToSkinContact" BOOLEAN,
    "babySex" TEXT,
    "babyBirthWeightKg" DOUBLE PRECISION,
    "babyCondition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostnatalVisit" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "visitType" "PostnatalVisitType" NOT NULL,
    "dateOfVisit" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "pulse" INTEGER,
    "temperature" DOUBLE PRECISION,
    "urineProt" "UrineTestResult",
    "urineSugar" "UrineTestResult",
    "fundalHeight" DOUBLE PRECISION,
    "lochiaColour" TEXT,
    "lochiaOdour" TEXT,
    "incisionPerineumCs" TEXT,
    "conditionOfBreastNipple" TEXT,
    "moodChanges" TEXT,
    "ifaSupplied" INTEGER,
    "complaints" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostnatalVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "dateGiven" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vaccination_patientId_idx" ON "Vaccination"("patientId");

-- CreateIndex
CREATE INDEX "IptpDose_patientId_idx" ON "IptpDose"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRecord_patientId_key" ON "DeliveryRecord"("patientId");

-- CreateIndex
CREATE INDEX "DeliveryRecord_patientId_idx" ON "DeliveryRecord"("patientId");

-- CreateIndex
CREATE INDEX "PostnatalVisit_patientId_idx" ON "PostnatalVisit"("patientId");

-- CreateIndex
CREATE INDEX "LabResult_patientId_idx" ON "LabResult"("patientId");

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IptpDose" ADD CONSTRAINT "IptpDose_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRecord" ADD CONSTRAINT "DeliveryRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRecord" ADD CONSTRAINT "DeliveryRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostnatalVisit" ADD CONSTRAINT "PostnatalVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostnatalVisit" ADD CONSTRAINT "PostnatalVisit_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
