-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "bfForMalaria" TEXT,
ADD COLUMN     "hbFirstVisit" DOUBLE PRECISION,
ADD COLUMN     "physicalExamAtFirstVisit" JSONB,
ADD COLUMN     "stoolRE" TEXT,
ADD COLUMN     "urineRE" TEXT;
