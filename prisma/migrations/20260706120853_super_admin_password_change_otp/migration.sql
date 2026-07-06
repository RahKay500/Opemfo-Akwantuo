-- AlterTable
ALTER TABLE "SuperAdmin" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "pendingPasswordHash" TEXT;
