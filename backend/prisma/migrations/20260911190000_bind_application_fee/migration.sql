ALTER TABLE `ApplicationFeePayment`
  ADD COLUMN `customerId` VARCHAR(191) NULL,
  ADD COLUMN `applicationId` VARCHAR(191) NULL,
  ADD COLUMN `consumedAt` DATETIME(3) NULL;

CREATE INDEX `ApplicationFeePayment_customerId_idx` ON `ApplicationFeePayment`(`customerId`);
CREATE INDEX `ApplicationFeePayment_applicationId_idx` ON `ApplicationFeePayment`(`applicationId`);
