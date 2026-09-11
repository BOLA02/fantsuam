ALTER TABLE `Guarantor` ADD COLUMN `applicationId` VARCHAR(191) NULL;
CREATE INDEX `Guarantor_applicationId_idx` ON `Guarantor`(`applicationId`);
ALTER TABLE `Guarantor`
  ADD CONSTRAINT `Guarantor_applicationId_fkey`
  FOREIGN KEY (`applicationId`) REFERENCES `LoanApplication`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
