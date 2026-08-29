/*
  Warnings:

  - You are about to drop the column `activeCustomerId` on the `savingsaccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[centralEmployeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `SavingsAccount_activeCustomerId_key` ON `SavingsAccount`;

-- AlterTable
ALTER TABLE `SavingsAccount` DROP COLUMN `activeCustomerId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `centralEmployeeId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_centralEmployeeId_key` ON `User`(`centralEmployeeId`);

-- CreateIndex
CREATE INDEX `User_centralEmployeeId_idx` ON `User`(`centralEmployeeId`);
