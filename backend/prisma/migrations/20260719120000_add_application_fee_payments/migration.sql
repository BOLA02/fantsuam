ALTER TABLE `OrganizationSettings`
  ADD COLUMN `applicationFeeEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `applicationFeeAmount` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `ApplicationFeePayment` (
  `id` VARCHAR(191) NOT NULL,
  `reference` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `amount` INTEGER NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `paystackId` VARCHAR(191) NULL,
  `paidAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `ApplicationFeePayment_reference_key`(`reference`),
  UNIQUE INDEX `ApplicationFeePayment_paystackId_key`(`paystackId`),
  INDEX `ApplicationFeePayment_email_idx`(`email`),
  INDEX `ApplicationFeePayment_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
