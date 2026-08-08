-- DropForeignKey
ALTER TABLE `Customer` DROP FOREIGN KEY `Customer_branchId_fkey`;

-- DropIndex
DROP INDEX `Customer_branchId_fkey` ON `Customer`;

-- AlterTable
ALTER TABLE `Customer` MODIFY `branchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
