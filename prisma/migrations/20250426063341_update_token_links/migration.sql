/*
  Warnings:

  - You are about to drop the column `links` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Token` DROP COLUMN `links`,
    ADD COLUMN `telegramLink` VARCHAR(191) NULL,
    ADD COLUMN `twitterLink` VARCHAR(191) NULL,
    ADD COLUMN `websiteLink` VARCHAR(191) NULL;
