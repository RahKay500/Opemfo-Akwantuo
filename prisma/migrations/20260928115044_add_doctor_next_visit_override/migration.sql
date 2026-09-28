-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "doctorNextVisitOverride" TIMESTAMP(3),
ADD COLUMN     "doctorNextVisitOverrideById" TEXT;
-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctorNextVisitOverrideById_fkey" FOREIGN KEY ("doctorNextVisitOverrideById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
