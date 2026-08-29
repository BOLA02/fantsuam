DROP INDEX `SavingsAccount_activeCustomerId_key` ON `SavingsAccount`;

ALTER TABLE `SavingsAccount` DROP COLUMN `activeCustomerId`;

ALTER TABLE `User` ADD COLUMN `centralEmployeeId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_centralEmployeeId_key` ON `User`(`centralEmployeeId`);

CREATE INDEX `User_centralEmployeeId_idx` ON `User`(`centralEmployeeId`);