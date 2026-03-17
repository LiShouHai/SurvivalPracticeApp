/*
  Warnings:

  - You are about to drop the column `checked_at` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `openid` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,checkin_date]` on the table `checkins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wx_openid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[unionid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checkin_date` to the `checkins` table without a default value. This is not possible if the table is not empty.
  - Made the column `nickname` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `checkins` DROP FOREIGN KEY `checkins_plan_id_fkey`;

-- DropForeignKey
ALTER TABLE `plans` DROP FOREIGN KEY `plans_user_id_fkey`;

-- DropIndex
DROP INDEX `users_openid_key` ON `users`;

-- AlterTable
ALTER TABLE `checkins` DROP COLUMN `checked_at`,
    DROP COLUMN `duration`,
    DROP COLUMN `note`,
    DROP COLUMN `plan_id`,
    ADD COLUMN `checkin_date` DATE NOT NULL,
    ADD COLUMN `checkin_time` TIME NULL,
    ADD COLUMN `location` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `openid`,
    ADD COLUMN `password_hash` VARCHAR(191) NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `unionid` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(191) NULL,
    ADD COLUMN `wx_openid` VARCHAR(191) NULL,
    MODIFY `nickname` VARCHAR(191) NOT NULL DEFAULT '健身达人';

-- DropTable
DROP TABLE `plans`;

-- CreateTable
CREATE TABLE `auth_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auth_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `color` VARCHAR(191) NULL,

    UNIQUE INDEX `exercise_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(191) NULL,

    INDEX `exercise_groups_category_id_idx`(`category_id`),
    UNIQUE INDEX `exercise_groups_category_id_code_key`(`category_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `equipment` VARCHAR(191) NULL,
    `is_custom` BOOLEAN NOT NULL DEFAULT false,
    `created_by` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `exercises_category_id_idx`(`category_id`),
    INDEX `exercises_group_id_idx`(`group_id`),
    INDEX `exercises_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NULL,
    `duration_sec` INTEGER NULL DEFAULT 0,
    `total_volume` INTEGER NULL DEFAULT 0,
    `total_sets` INTEGER NULL DEFAULT 0,
    `completed_sets` INTEGER NULL DEFAULT 0,
    `calories_est` INTEGER NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `workout_sessions_user_id_start_time_idx`(`user_id`, `start_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workout_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NULL,
    `name_snapshot` VARCHAR(191) NOT NULL,
    `category_snapshot` VARCHAR(191) NOT NULL,
    `group_snapshot` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,

    INDEX `workout_exercises_workout_id_idx`(`workout_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workout_exercise_id` INTEGER NOT NULL,
    `set_index` INTEGER NOT NULL,
    `weight` DECIMAL(8, 2) NULL,
    `reps` INTEGER NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `workout_sets_workout_exercise_id_idx`(`workout_exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workout_templates_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_template_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,

    INDEX `workout_template_items_template_id_idx`(`template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `checkins_user_id_checkin_date_key` ON `checkins`(`user_id`, `checkin_date`);

-- CreateIndex
CREATE UNIQUE INDEX `users_wx_openid_key` ON `users`(`wx_openid`);

-- CreateIndex
CREATE UNIQUE INDEX `users_unionid_key` ON `users`(`unionid`);

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- AddForeignKey
ALTER TABLE `auth_tokens` ADD CONSTRAINT `auth_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_groups` ADD CONSTRAINT `exercise_groups_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `exercise_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `exercise_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `exercise_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_exercises` ADD CONSTRAINT `workout_exercises_workout_id_fkey` FOREIGN KEY (`workout_id`) REFERENCES `workout_sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sets` ADD CONSTRAINT `workout_sets_workout_exercise_id_fkey` FOREIGN KEY (`workout_exercise_id`) REFERENCES `workout_exercises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_templates` ADD CONSTRAINT `workout_templates_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_template_items` ADD CONSTRAINT `workout_template_items_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_template_items` ADD CONSTRAINT `workout_template_items_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
