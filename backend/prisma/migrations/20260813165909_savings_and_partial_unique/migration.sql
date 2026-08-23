-- CreateTable
CREATE TABLE `SavingsAccount` (
    `id` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `openedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `SavingsAccount_accountNumber_key`(`accountNumber`),
    INDEX `SavingsAccount_customerId_idx`(`customerId`),
    INDEX `SavingsAccount_accountNumber_idx`(`accountNumber`),
    INDEX `SavingsAccount_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `SavingsAccount`
  ADD COLUMN `activeCustomerId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  GENERATED ALWAYS AS (CASE WHEN `deletedAt` IS NULL THEN `customerId` ELSE NULL END) STORED;

CREATE UNIQUE INDEX `SavingsAccount_activeCustomerId_key`
  ON `SavingsAccount` (`activeCustomerId`);

-- CreateTable
CREATE TABLE `SavingsTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `savingsAccountId` VARCHAR(191) NOT NULL,
    `transactionType` ENUM('DEPOSIT', 'WITHDRAWAL', 'ADJUSTMENT') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `balanceBefore` DECIMAL(15, 2) NOT NULL,
    `balanceAfter` DECIMAL(15, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY') NOT NULL,
    `description` VARCHAR(191) NULL,
    `performedById` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SavingsTransaction_reference_key`(`reference`),
    UNIQUE INDEX `SavingsTransaction_transactionId_key`(`transactionId`),
    INDEX `SavingsTransaction_savingsAccountId_idx`(`savingsAccountId`),
    INDEX `SavingsTransaction_performedById_idx`(`performedById`),
    INDEX `SavingsTransaction_transactionType_idx`(`transactionType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `transaction` MODIFY `transactionType` ENUM('LOAN_DISBURSEMENT', 'REPAYMENT', 'INTEREST', 'PENALTY', 'PROCESSING_FEE', 'ADJUSTMENT', 'SAVINGS_DEPOSIT', 'SAVINGS_WITHDRAWAL') NOT NULL;

-- AddForeignKey
ALTER TABLE `SavingsAccount` ADD CONSTRAINT `SavingsAccount_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavingsAccount` ADD CONSTRAINT `SavingsAccount_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavingsTransaction` ADD CONSTRAINT `SavingsTransaction_savingsAccountId_fkey` FOREIGN KEY (`savingsAccountId`) REFERENCES `SavingsAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavingsTransaction` ADD CONSTRAINT `SavingsTransaction_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavingsTransaction` ADD CONSTRAINT `SavingsTransaction_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
