-- AlterTable
ALTER TABLE "PartnerLink" ADD COLUMN     "partnerName" TEXT,
ADD COLUMN     "partnerPhone" TEXT,
ADD COLUMN     "shareAppointments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shareMedicalHistory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareProgress" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shareReferralStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareVisitSummaries" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shareVitals" BOOLEAN NOT NULL DEFAULT true;
