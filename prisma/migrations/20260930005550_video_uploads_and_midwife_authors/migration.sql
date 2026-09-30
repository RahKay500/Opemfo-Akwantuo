-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_addedById_fkey";

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "addedByLabel" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT;
