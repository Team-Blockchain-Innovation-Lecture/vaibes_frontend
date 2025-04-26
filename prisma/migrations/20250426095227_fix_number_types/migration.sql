/*
  Warnings:

  - You are about to drop the column `fullyDilutedValue` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `metaplexIsMutable` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `metaplexMasterEdition` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `metaplexMetadataUri` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `metaplexPrimarySaleHappened` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `metaplexSellerFeeBasisPoints` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `metaplexUpdateAuthority` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `standard` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `totalSupplyFormatted` on the `Token` table. All the data in the column will be lost.
  - You are about to alter the column `decimals` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `totalSupply` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `creator` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Token` DROP COLUMN `fullyDilutedValue`,
    DROP COLUMN `metaplexIsMutable`,
    DROP COLUMN `metaplexMasterEdition`,
    DROP COLUMN `metaplexMetadataUri`,
    DROP COLUMN `metaplexPrimarySaleHappened`,
    DROP COLUMN `metaplexSellerFeeBasisPoints`,
    DROP COLUMN `metaplexUpdateAuthority`,
    DROP COLUMN `standard`,
    DROP COLUMN `totalSupplyFormatted`,
    ADD COLUMN `creator` VARCHAR(191) NOT NULL,
    ADD COLUMN `marketCap` DOUBLE NULL,
    ADD COLUMN `tokenProgram` VARCHAR(191) NULL,
    MODIFY `decimals` INTEGER NULL,
    MODIFY `totalSupply` INTEGER NULL;
