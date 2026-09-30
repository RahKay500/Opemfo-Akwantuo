-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PARTNER';

-- DropForeignKey
ALTER TABLE "PartnerLink" DROP CONSTRAINT "PartnerLink_patientId_fkey";

-- DropIndex
DROP INDEX "PartnerLink_token_key";

-- AlterTable
ALTER TABLE "PartnerLink" DROP COLUMN "token",
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "PartnerLink_userId_idx" ON "PartnerLink"("userId");

-- AddForeignKey
ALTER TABLE "PartnerLink" ADD CONSTRAINT "PartnerLink_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerLink" ADD CONSTRAINT "PartnerLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
