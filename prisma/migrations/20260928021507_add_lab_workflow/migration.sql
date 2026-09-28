-- CreateEnum
CREATE TYPE "LabRequestStatus" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'READY', 'CANCELLED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'LAB_TECHNICIAN';

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "notifyLabResults" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "LabRequest" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "notes" TEXT,
    "status" "LabRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "eta" TEXT,
    "result" TEXT,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "completedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LabRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabRequest_facilityId_idx" ON "LabRequest"("facilityId");

-- CreateIndex
CREATE INDEX "LabRequest_patientId_idx" ON "LabRequest"("patientId");

-- CreateIndex
CREATE INDEX "LabRequest_status_idx" ON "LabRequest"("status");

-- AddForeignKey
ALTER TABLE "LabRequest" ADD CONSTRAINT "LabRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequest" ADD CONSTRAINT "LabRequest_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequest" ADD CONSTRAINT "LabRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequest" ADD CONSTRAINT "LabRequest_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

