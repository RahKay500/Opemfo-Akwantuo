-- DropForeignKey
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_districtId_fkey";

-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "district",
DROP COLUMN "region",
ALTER COLUMN "districtId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

