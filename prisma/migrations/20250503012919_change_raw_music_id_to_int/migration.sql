-- CreateTable
CREATE TABLE `Token` (
    `id` VARCHAR(191) NOT NULL,
    `mint` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `creator` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `decimals` INTEGER NULL,
    `totalSupply` BIGINT NULL,
    `tokenProgram` VARCHAR(191) NULL,
    `marketCap` DOUBLE NULL,
    `telegramLink` VARCHAR(191) NULL,
    `websiteLink` VARCHAR(191) NULL,
    `twitterLink` VARCHAR(191) NULL,
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
    `creator` VARCHAR(191) NOT NULL DEFAULT '0x000',
    `status` VARCHAR(191) NOT NULL DEFAULT 'processing',
    `playCount` INTEGER NOT NULL DEFAULT 0,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `tokenId` VARCHAR(191) NOT NULL,

    INDEX `Video_tokenId_idx`(`tokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VideoLike` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `videoId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VideoLike_userId_idx`(`userId`),
    INDEX `VideoLike_videoId_idx`(`videoId`),
    UNIQUE INDEX `VideoLike_userId_videoId_key`(`userId`, `videoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `userAddress` VARCHAR(191) NOT NULL,
    `videoId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comment_videoId_idx`(`videoId`),
    INDEX `Comment_parentId_idx`(`parentId`),
    INDEX `Comment_userAddress_idx`(`userAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Raw_music` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userAddress` VARCHAR(191) NOT NULL,
    `task_id` VARCHAR(191) NOT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `audio_url` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `prompt` TEXT NULL,

    UNIQUE INDEX `Raw_music_task_id_key`(`task_id`),
    INDEX `Raw_music_userAddress_idx`(`userAddress`),
    INDEX `Raw_music_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Raw_video` (
    `id` VARCHAR(191) NOT NULL,
    `userAddress` VARCHAR(191) NOT NULL,
    `task_id` VARCHAR(191) NOT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `video_url` VARCHAR(191) NULL,

    INDEX `Raw_video_userAddress_idx`(`userAddress`),
    INDEX `Raw_video_task_id_idx`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `Token`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoLike` ADD CONSTRAINT `VideoLike_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
