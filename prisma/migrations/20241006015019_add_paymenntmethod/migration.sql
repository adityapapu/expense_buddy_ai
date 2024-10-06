/*
  Warnings:

  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethodId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaction` table. All the data in the column will be lost.
  - The primary key for the `TransactionParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `share` on the `TransactionParticipant` table. All the data in the column will be lost.
  - You are about to drop the `_TagToTransaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,userId]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `PaymentMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `TransactionParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `TransactionParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethodId` to the `TransactionParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TransactionParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "_TagToTransaction" DROP CONSTRAINT "_TagToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToTransaction" DROP CONSTRAINT "_TagToTransaction_B_fkey";

-- DropIndex
DROP INDEX "PaymentMethod_name_key";

-- DropIndex
DROP INDEX "Transaction_categoryId_idx";

-- DropIndex
DROP INDEX "Transaction_userId_date_idx";

-- DropIndex
DROP INDEX "TransactionParticipant_userId_idx";

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amount",
DROP COLUMN "categoryId",
DROP COLUMN "paymentMethodId",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "TransactionParticipant" DROP CONSTRAINT "TransactionParticipant_pkey",
DROP COLUMN "share",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "paymentMethodId" TEXT NOT NULL,
ADD COLUMN     "type" "TransactionType" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TransactionParticipant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TransactionParticipant_id_seq";

-- DropTable
DROP TABLE "_TagToTransaction";

-- CreateTable
CREATE TABLE "_TagToTransactionParticipant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TagToTransactionParticipant_AB_unique" ON "_TagToTransactionParticipant"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToTransactionParticipant_B_index" ON "_TagToTransactionParticipant"("B");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_userId_key" ON "PaymentMethod"("name", "userId");

-- CreateIndex
CREATE INDEX "Transaction_creatorId_date_idx" ON "Transaction"("creatorId", "date");

-- CreateIndex
CREATE INDEX "TransactionParticipant_userId_categoryId_idx" ON "TransactionParticipant"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionParticipant" ADD CONSTRAINT "TransactionParticipant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionParticipant" ADD CONSTRAINT "TransactionParticipant_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTransactionParticipant" ADD CONSTRAINT "_TagToTransactionParticipant_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTransactionParticipant" ADD CONSTRAINT "_TagToTransactionParticipant_B_fkey" FOREIGN KEY ("B") REFERENCES "TransactionParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
