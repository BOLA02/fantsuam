/*
  Warnings:

  - Added the required column `confirmationStatus` to the `Repayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionGroupId` to the `Repayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `repayment` ADD COLUMN `confirmationStatus` ENUM('PENDING_VERIFICATION', 'CONFIRMED') NOT NULL,
    ADD COLUMN `confirmedAt` DATETIME(3) NULL,
    ADD COLUMN `confirmedById` VARCHAR(191) NULL,
    ADD COLUMN `interestApplied` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `principalApplied` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `transactionGroupId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `repaymentschedule` ADD COLUMN `paidInterest` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `paidPrincipal` DECIMAL(15, 2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Repayment_transactionGroupId_idx` ON `Repayment`(`transactionGroupId`);

-- CreateIndex
CREATE INDEX `Repayment_confirmationStatus_idx` ON `Repayment`(`confirmationStatus`);

-- AddForeignKey
ALTER TABLE `Repayment` ADD CONSTRAINT `Repayment_confirmedById_fkey` FOREIGN KEY (`confirmedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
