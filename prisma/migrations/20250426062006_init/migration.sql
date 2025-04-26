-- CreateTable
CREATE TABLE `Token` (
    `id` VARCHAR(191) NOT NULL,
    `mint` VARCHAR(191) NOT NULL,
    `standard` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `decimals` VARCHAR(191) NULL,
    `fullyDilutedValue` VARCHAR(191) NULL,
    `totalSupply` VARCHAR(191) NULL,
    `totalSupplyFormatted` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `metaplexMetadataUri` VARCHAR(191) NULL,
    `metaplexMasterEdition` BOOLEAN NULL,
    `metaplexIsMutable` BOOLEAN NULL,
    `metaplexSellerFeeBasisPoints` INTEGER NULL,
    `metaplexUpdateAuthority` VARCHAR(191) NULL,
    `metaplexPrimarySaleHappened` INTEGER NULL,
    `links` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Token_mint_key`(`mint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` VARCHAR(191) NOT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `duration` INTEGER NULL,
    `createdWith` VARCHAR(191) NULL,
    `prompt` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'processing',
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `tokenId` VARCHAR(191) NOT NULL,

    INDEX `Video_tokenId_idx`(`tokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `Token`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
