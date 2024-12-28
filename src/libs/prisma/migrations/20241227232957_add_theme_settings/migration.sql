/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `savedCart` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `savedCart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `savedCart` DROP COLUMN `backgroundColor`,
    DROP COLUMN `textColor`;

-- CreateTable
CREATE TABLE `themeSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL DEFAULT 'Welcome to your saved cart feature!',
    `textColor` VARCHAR(191) NOT NULL DEFAULT '#333333',
    `backgroundColor` VARCHAR(191) NOT NULL DEFAULT '#f5f5f5',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
