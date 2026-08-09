-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_toFacilityId_fkey";

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "externalHospitalName" TEXT,
ADD COLUMN     "externalHospitalPhone" TEXT,
ALTER COLUMN "toFacilityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_toFacilityId_fkey" FOREIGN KEY ("toFacilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
