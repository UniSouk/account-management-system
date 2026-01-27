/*
  Warnings:

  - You are about to drop the column `accountManager` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the `UploadLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UploadLink" DROP CONSTRAINT "UploadLink_sellerId_fkey";

-- AlterTable
ALTER TABLE "Seller" DROP COLUMN "accountManager",
ADD COLUMN     "accountManagerEmail" TEXT,
ADD COLUMN     "accountManagerMobile" TEXT,
ADD COLUMN     "accountManagerName" TEXT;

-- DropTable
DROP TABLE "UploadLink";
