-- MyEMS User Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_user_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_user_db` ;
CREATE DATABASE IF NOT EXISTS `myems_user_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_user_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_users` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `display_name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `salt` VARCHAR(128) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  `is_admin` BOOL NOT NULL ,
  `is_read_only` BOOL NOT NULL DEFAULT 0,
  `privilege_id` BIGINT NULL,
  `account_expiration_datetime_utc` DATETIME NOT NULL,
  `password_expiration_datetime_utc` DATETIME NOT NULL,
  `failed_login_count` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

  -- --------------------------------------------------------------------------------------------------------------------
  -- Example Data for table `myems_user_db`.`tbl_users`
  -- --------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_user_db`;
-- default username: administrator
-- default password: !MyEMS1
INSERT INTO `myems_user_db`.`tbl_users`(`id`, `name`, `uuid`, `display_name`, `email`, `salt`, `password`, `is_admin`, `privilege_id`, `account_expiration_datetime_utc`, `password_expiration_datetime_utc`, `failed_login_count`)
VALUES
(1, 'administrator', 'dcdb67d1-6116-4987-916f-6fc6cf2bc0e4', 'Administrator', 'administrator@myems.io', 'adfd6fb6d78d4e3780ebdd6afdec2c3a', 'bc00df65270b1a72b9ed37136fa95a695896edc8c114391821f5edc6b1bbdbabc3d449962f8d1c7a4ec3f2d0a1a79055623963d88ecb9b778423194ff7b6be42', 1, NULL, '2099-12-31 16:00:00', '2099-12-31 16:00:00', 0);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_privileges`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_privileges` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_privileges` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `data` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_sessions`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_sessions` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_uuid` CHAR(36) NOT NULL,
  `token` VARCHAR(128) NOT NULL,
  `utc_expires` DATETIME NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_logs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_logs` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_uuid` CHAR(36) NOT NULL,
  `request_datetime_utc` DATETIME NOT NULL,
  `request_method` VARCHAR(256) NOT NULL,
  `resource_type` VARCHAR(256) NOT NULL,
  `resource_id` BIGINT NULL,
  `request_body` LONGTEXT NULL COMMENT 'MUST be in JSON format',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_logs_index_1` ON  `myems_user_db`.`tbl_logs`  (`user_uuid`, `request_datetime_utc`, `request_method`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_notifications`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_notifications` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'unread, read, archived',
  `subject` VARCHAR(128) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `url` VARCHAR(128),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_notifications_index_1` ON  `myems_user_db`.`tbl_notifications`  (`user_id`, `created_datetime_utc`, `status`);
