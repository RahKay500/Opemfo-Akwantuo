-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "facilityId" TEXT;

-- AlterTable
ALTER TABLE "SuperAdmin" ADD COLUMN     "facilityId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_facilityId_idx" ON "AuditLog"("facilityId");

-- CreateIndex
CREATE INDEX "SuperAdmin_facilityId_idx" ON "SuperAdmin"("facilityId");

-- AddForeignKey
ALTER TABLE "SuperAdmin" ADD CONSTRAINT "SuperAdmin_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
