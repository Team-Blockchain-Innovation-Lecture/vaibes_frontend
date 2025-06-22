-- MySQL dump 10.13  Distrib 8.0.41, for Linux (aarch64)
--
-- Host: localhost    Database: vaibes_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `vaibes_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `vaibes_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `vaibes_db`;

--
-- Table structure for table `Token`
--

DROP TABLE IF EXISTS `Token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Token` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mint` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `decimals` int DEFAULT NULL,
  `totalSupply` bigint DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `telegramLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitterLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `websiteLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marketCap` double DEFAULT NULL,
  `tokenProgram` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Token_mint_key` (`mint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Token`
--

LOCK TABLES `Token` WRITE;
/*!40000 ALTER TABLE `Token` DISABLE KEYS */;
INSERT INTO `Token` VALUES ('cm9y4sat30003rhv9pdifqa7h','2YnfHiDkwUhgDXcpMrJNifBvYwnHq7eHr2oCobeHpump','FRIDGE','FRIDGE','https://gateway.pinata.cloud/ipfs/QmViczyThfRo2mZCJwrtzRf2GHErH8XXdM17NDcy4c54V4',6,999999999999999,'It\'s always the fridge protecting the snacks','2025-04-26 11:22:19.959','2025-04-26 11:22:19.959',NULL,NULL,NULL,'A73ceNNEE3aqeMYsEVjA4zEd4P99tcRc6mvSKJBoigTs',9816.39999999999,'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),('cm9y4tydp0006rhv9zsyxne26','FWS8yisG7ML8iSpAxC8Joozn7qpNQpScCX8Nfipipump','giga dog','ギガ','https://gateway.pinata.cloud/ipfs/QmXE4rEsBm2pZCWEiBQX42V9WvQohRpNDan51m2nSgyZy2',6,999999948612780,'','2025-04-26 11:23:37.165','2025-04-27 17:17:17.017',NULL,'https://x.com/Gekikawa_Dbts/status/1915750380786663785',NULL,'GZVSEAajExLJEvACHHQcujBw7nJq98GWUEZtood9LM9b',4772.274202823282,'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),('cm9z7nff20000rho1lvgbux8x','723oJSXhGwiPez2LC9EZnLKracYzxQfzpHhTFUuzpump','Pump.Now','NOW','https://gateway.pinata.cloud/ipfs/QmRhkTXm8qHkmK77QmLAvRjXjza7LQP5vgdNvrm6xooNxZ',6,1000000000000000,'I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW I NEED A PUMP NOW','2025-04-27 05:30:17.678','2025-04-27 05:30:17.678',NULL,'x.com/solananerd',NULL,'9n5hPMc8uwU8YfcpkcpwcGpnrscQBTsidbN3p87LCvg3',NULL,'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),('cm9z82imx0000rh0l1g3z49yw','8kxirdESKrV1fubyiM1fSShDLhx7WBrWoaK3hxhupump','Psychological Weapon','EvilGPT','https://gateway.pinata.cloud/ipfs/QmapYsT8fGHMFTvB5GdHC1XtURRM4TUUTnDptY2VtHTYeD',6,999999926337968,'','2025-04-27 05:42:01.690','2025-04-27 05:44:08.023',NULL,'https://x.com/MarioNawfal/status/1916338182854967560','https://x.com/MarioNawfal/status/1916338182854967560','zEdXdQjS8A4jxjQt9YqadVSRWCdn4VG1GU6o3ETA44G',NULL,'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),('cm9z8803o0005rh0lasmatw23','5b84cGDprCMotakyudx2Qx386m6xwJ4DbReYo293vV3Z','FRIDGEv2','FRIDGEv2','https://gateway.pinata.cloud/ipfs/QmZHHDudscstdByFokt31w5EWpjne98S4pkj3EDPN67Jd2',6,1000000000000000,'First coin to be launched and run, completely on a fridge','2025-04-27 05:46:17.604','2025-04-27 05:46:17.604',NULL,NULL,NULL,'Unknown Creator',NULL,'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),('cm9z88qel0008rh0luhq7vknl','Fz2SXFAAtUWE3G9SbYKBPDdDd4Rzy5i5yW192KCFpump','legendary fridge pull','lfp','https://gateway.pinata.cloud/ipfs/QmSuGjNYTkGFAMgrecVfz6tEBkjkfnmUuirMMf1FRWonLK',6,998950785581915,'grandmas fridge is stacked\r\n','2025-04-27 05:46:51.694','2025-04-27 05:46:51.694','https://t.me/+w_9LpNrlPNg0NzRh','https://x.com/FridgePullsol',NULL,'Unknown Creator',5063.931269811123,'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
/*!40000 ALTER TABLE `Token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Video`
--

DROP TABLE IF EXISTS `Video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Video` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnailUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `createdWith` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prompt` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'processing',
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `tokenId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `likeCount` int NOT NULL DEFAULT '0',
  `playCount` int NOT NULL DEFAULT '0',
  `creator` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0x000',
  `nft_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Video_tokenId_idx` (`tokenId`),
  CONSTRAINT `Video_tokenId_fkey` FOREIGN KEY (`tokenId`) REFERENCES `Token` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Video`
--

LOCK TABLES `Video` WRITE;
/*!40000 ALTER TABLE `Video` DISABLE KEYS */;
INSERT INTO `Video` VALUES ('cm9y4sata0005rhv9v8tkgl03','Marry/wedding/charch 1','marry/wedding/charch 1 wowwowwow','https://vaibes-sample-video.s3.ap-northeast-1.amazonaws.com/vertical/-tCkoo6YAcjiBSC3gEs7J_video-1745664965.mp4','https://www.home-movie.biz/images/sam001.jpg',13,'AI Video Generator','Create an animated video showcasing this token','processing',NULL,'2025-04-26 11:22:19.967','2025-04-29 03:01:58.479','cm9y4sat30003rhv9pdifqa7h',0,24,'Hx36baCpLNVBKhxzpjs765MJE5RGQ7nXs3mzWbJ8iMq2',NULL),('cm9y4tye80008rhv9s899x4mb','Marry/wedding/charch 2','marry/wedding/charch 2 wowwowwow','https://vaibes-sample-video.s3.ap-northeast-1.amazonaws.com/vertical/OH4Cn68vWZv0WfpTvWUny_3486390a-739e-45b6-9b62-043d817c1fe7.mp4','https://www.home-movie.biz/images/sam002.jpg',15,'AI Video Generator','Create an animated video showcasing this token','processing',NULL,'2025-04-26 11:23:37.184','2025-04-29 03:02:00.421','cm9y4tydp0006rhv9zsyxne26',1,71,'Hx36baCpLNVBKhxzpjs765MJE5RGQ7nXs3mzWbJ8iMq2',NULL),('cm9z7nfff0002rho18abnmu2k','Scenery/tree/wind 1','scenery/tree/wind 1 abc ','https://vaibes-sample-video.s3.ap-northeast-1.amazonaws.com/vertical/p5yiiGrfGr9dDzp2pU5-u_ded713fd-6f79-4089-ae82-b86e0cf3f4f8.mp4','https://www.home-movie.biz/images/sam003.jpg',14,'AI Video Generator','Create an animated video showcasing this token','processing',NULL,'2025-04-27 05:30:17.691','2025-04-29 03:02:01.007','cm9z7nff20000rho1lvgbux8x',0,49,'ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU',NULL),('cm9z82in70002rh0lfcvm7b1l','Scenery/tree/wind 2','Scenery/tree/wind 2fksjsf','https://vaibes-sample-video.s3.ap-northeast-1.amazonaws.com/vertical/pcboWlVNvhhfM7xc6aOgF_video-1745766503+(1).mp4','https://www.home-movie.biz/images/sam004.jpg',20,'AI Video Generator','Create an animated video showcasing this token','processing',NULL,'2025-04-27 05:42:01.699','2025-04-29 03:02:01.654','cm9z82imx0000rh0l1g3z49yw',0,94,'ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU',NULL),('cm9z8584h0004rh0lcgrp1n6h','Water','Water Water Water Water','https://vaibes-sample-video.s3.ap-northeast-1.amazonaws.com/vertical/pcboWlVNvhhfM7xc6aOgF_video-1745766503.mp4','https://www.home-movie.biz/images/sam005.jpg',21,'AI Video Generator','Create an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this token','processing',NULL,'2025-04-27 05:44:08.034','2025-04-29 03:02:02.426','cm9z82imx0000rh0l1g3z49yw',0,160,'nHSjCbSd3XD3UwGy5uAAUqEfDf4kBDYaJZ4eF82nCDZ',NULL),('cm9z8803y0007rh0l3v61m9ie','Sea','Sea Sea Sea Sea Sea Sea Sea Sea','https://vaibes-sample-video.s3.ap-northeast-1.amazonaws.com/vertical/result.mp4','https://www.home-movie.biz/images/sam006.jpg',16,'AI Video Generator','Create an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this token!!!!!!!!!!','processing',NULL,'2025-04-27 05:46:17.614','2025-04-29 03:02:03.386','cm9z8803o0005rh0lasmatw23',1,138,'nHSjCbSd3XD3UwGy5uAAUqEfDf4kBDYaJZ4eF82nCDZ',NULL),('cm9z88qeu000arh0l10dbagen','Sea 2','Sea2 22222222','https://vaibes-sample-video.s3.ap-northeast-1.amazonaws.com/vertical/result.mp4','https://www.home-movie.biz/images/sam007.jpg',15,'AI Video Generator','Create an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this tokenCreate an animated video showcasing this token!!!!!','processing',NULL,'2025-04-27 05:46:51.702','2025-04-28 18:51:49.814','cm9z88qel0008rh0luhq7vknl',0,38,'nHSjCbSd3XD3UwGy5uAAUqEfDf4kBDYaJZ4eF82nCDZ',NULL),('cm9zwwmef0001rhque5ybfomj','Example Video Title','This is a sample video description','https://example.com/video.mp4','https://example.com/thumbnail.jpg',120,'AI Video Generator','Create an animated video showcasing this token','processing',NULL,'2025-04-27 17:17:17.030','2025-04-28 18:32:01.071','cm9y4tydp0006rhv9zsyxne26',0,13,'Gm5P8UaSG1CbFhN5ACnXVMKpvKMMX8LFQr9km7oMS6Jm',NULL);
/*!40000 ALTER TABLE `Video` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Comment`
--

DROP TABLE IF EXISTS `Comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Comment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `userAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Comment_videoId_idx` (`videoId`),
  KEY `Comment_parentId_idx` (`parentId`),
  KEY `Comment_userAddress_idx` (`userAddress`),
  CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Comment_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comment`
--

LOCK TABLES `Comment` WRITE;
/*!40000 ALTER TABLE `Comment` DISABLE KEYS */;
INSERT INTO `Comment` VALUES ('cma1af1ke0005rh8zmhrwsatu','Hi','ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU','cm9z8803y0007rh0l3v61m9ie',NULL,'2025-04-28 16:23:17.678'),('cma1af55m0007rh8zs3lutk7w','HHH','ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU','cm9z8803y0007rh0l3v61m9ie','cma1af1ke0005rh8zmhrwsatu','2025-04-28 16:23:22.330'),('cma1af7z90009rh8z1v1mgoxe','Hi','ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU','cm9z8803y0007rh0l3v61m9ie',NULL,'2025-04-28 16:23:25.989'),('cma1afc3l000brh8za7twotcq','Hi','ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU','cm9z8803y0007rh0l3v61m9ie',NULL,'2025-04-28 16:23:31.329');
/*!40000 ALTER TABLE `Comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VideoLike`
--

DROP TABLE IF EXISTS `VideoLike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VideoLike` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `videoId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `VideoLike_userId_videoId_key` (`userId`,`videoId`),
  KEY `VideoLike_userId_idx` (`userId`),
  KEY `VideoLike_videoId_idx` (`videoId`),
  CONSTRAINT `VideoLike_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VideoLike`
--

LOCK TABLES `VideoLike` WRITE;
/*!40000 ALTER TABLE `VideoLike` DISABLE KEYS */;
INSERT INTO `VideoLike` VALUES ('cma1a65nk0001rh8zcm89ljzs','privy:wallet','cm9y4tye80008rhv9s899x4mb','2025-04-28 16:16:23.072'),('cma1agj0e000drh8zgi4ivto1','privy:wallet','cm9z8803y0007rh0l3v61m9ie','2025-04-28 16:24:26.943');
/*!40000 ALTER TABLE `VideoLike` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Raw_music`
--

DROP TABLE IF EXISTS `Raw_music`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Raw_music` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `music_task_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `audio_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prompt` text COLLATE utf8mb4_unicode_ci,
  `video_style` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'anime',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Raw_music_task_id_key` (`task_id`),
  UNIQUE KEY `Raw_music_music_task_id_key` (`music_task_id`),
  KEY `Raw_music_userAddress_idx` (`userAddress`),
  KEY `Raw_music_task_id_idx` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Raw_music`
--

LOCK TABLES `Raw_music` WRITE;
/*!40000 ALTER TABLE `Raw_music` DISABLE KEYS */;
INSERT INTO `Raw_music` VALUES (1,'ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU','music_task_001','api_music_001',1,'https://example.com/audio1.mp3','https://example.com/image1.jpg','Create a relaxing ambient music','anime'),(2,'nHSjCbSd3XD3UwGy5uAAUqEfDf4kBDYaJZ4eF82nCDZ','music_task_002','api_music_002',1,'https://example.com/audio2.mp3','https://example.com/image2.jpg','Generate upbeat electronic music','anime'),(3,'Hx36baCpLNVBKhxzpjs765MJE5RGQ7nXs3mzWbJ8iMq2','music_task_003','api_music_003',0,NULL,NULL,'Create a dramatic orchestral piece','anime');
/*!40000 ALTER TABLE `Raw_music` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Raw_video`
--

DROP TABLE IF EXISTS `Raw_video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Raw_video` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_task_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `video_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `merged_video_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Raw_video_video_task_id_key` (`video_task_id`),
  KEY `Raw_video_userAddress_idx` (`userAddress`),
  KEY `Raw_video_task_id_idx` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Raw_video`
--

LOCK TABLES `Raw_video` WRITE;
/*!40000 ALTER TABLE `Raw_video` DISABLE KEYS */;
INSERT INTO `Raw_video` VALUES (1,'ENmvd82ut2HLYMYaJxRRHsR4GKo84X2qDRJgZau9GhdU','video_task_001','api_video_001',1,'https://example.com/video1.mp4','https://example.com/merged1.mp4'),(2,'nHSjCbSd3XD3UwGy5uAAUqEfDf4kBDYaJZ4eF82nCDZ','video_task_002','api_video_002',0,NULL,NULL),(3,'Hx36baCpLNVBKhxzpjs765MJE5RGQ7nXs3mzWbJ8iMq2','video_task_003','api_video_003',1,'https://example.com/video3.mp4',NULL);
/*!40000 ALTER TABLE `Raw_video` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('00a620a4-10da-4ed1-9b48-c62f45929156','112ee937da6654eb27171b41a796e631983327ab1f1429d16637bde178c7aba3','2025-04-26 06:33:41.426','20250426063341_update_token_links',NULL,NULL,'2025-04-26 06:33:41.413',1),('0481942f-2d58-49c2-a2a6-f6d81732fadd','c80f63bb452bc0be9869809d95c79b5b3e7e778618717d6d5bc489c4beeffa32','2025-04-28 16:08:33.138','20250428160832_add_video_comments',NULL,NULL,'2025-04-28 16:08:33.097',1),('2d57b872-aff8-4f85-8a36-d9842e720453','92ec2383f72bfa66427f8d5e4a83a3ccbd3a41a1d0c56545eb9f798cad8b6339','2025-04-26 09:52:27.141','20250426095227_fix_number_types',NULL,NULL,'2025-04-26 09:52:27.120',1),('33771303-8f81-4e53-bdfc-385b52300006','e1ee1614be4833aa907de39800ec1d922559d03e37af53b5d8862516f1b456cc','2025-04-26 17:18:05.726','20250426171805_add_play_like_counts',NULL,NULL,'2025-04-26 17:18:05.669',1),('cd0f8c29-367c-46d5-af31-26dbc1065a5b','0e73b43bb89b2a04e0165a7dc62979aa54666d08dd7d47d485086c510b87c967','2025-04-26 06:20:06.986','20250426062006_init',NULL,NULL,'2025-04-26 06:20:06.960',1),('d4f01746-cac7-47de-8b6c-5ec35adf8cb9','c4ed1b33d31c5cca677763a4018a295dedea2fc0b497548c275da9ab7959c099','2025-04-27 05:05:16.981','20250427050516_add_creator_field',NULL,NULL,'2025-04-27 05:05:16.973',1),('e8fc8f9d-d8ad-4104-b935-72c1b49fbe77','dec2eba60715386968bc0a671d836cc3845961b7c9c80c601cbf4ccf58e631eb','2025-04-26 11:02:51.073','20250426110250_to_bigint',NULL,NULL,'2025-04-26 11:02:51.055',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-29  3:09:33
