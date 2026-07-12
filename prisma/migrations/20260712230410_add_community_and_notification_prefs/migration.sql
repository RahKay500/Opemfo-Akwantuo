-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "community" TEXT,
ADD COLUMN     "notifyAppointments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyEducationalContent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyReferralUpdates" BOOLEAN NOT NULL DEFAULT true;
