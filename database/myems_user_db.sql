-- MyEMS User Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_user_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_user_db` ;
CREATE DATABASE IF NOT EXISTS `myems_user_db` ;
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
  `privilege_id` BIGINT NULL,
  PRIMARY KEY (`id`));

  -- --------------------------------------------------------------------------------------------------------------------
  -- Example Data for table `myems_user_db`.`tbl_users`
  -- --------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_user_db`;
-- default username: administrator
-- default password: !MyEMS1
INSERT INTO `myems_user_db`.`tbl_users`(`id`, `name`, `uuid`, `display_name`, `email`, `salt`, `password`, `is_admin`, `privilege_id`)
VALUES
(1, 'administrator', 'dcdb67d1-6116-4987-916f-6fc6cf2bc0e4', 'Administrator', 'administrator@myems.io', 'adfd6fb6d78d4e3780ebdd6afdec2c3a', 'bc00df65270b1a72b9ed37136fa95a695896edc8c114391821f5edc6b1bbdbabc3d449962f8d1c7a4ec3f2d0a1a79055623963d88ecb9b778423194ff7b6be42', 1, NULL);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_privileges`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_privileges` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_privileges` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `data` JSON NOT NULL,
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
  `user_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `activity` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`));


-- ----------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_notifications`
-- ----------------------------------------------------------------------------------
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


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_action_logs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_action_logs` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_action_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(256) NOT NULL,
  `date_time_utc` DATETIME NOT NULL,
  `action` VARCHAR(256) NOT NULL,
  `class` VARCHAR(256) NOT NULL,
  `record_id` BIGINT NULL,
  `record_text` JSON NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_action_logs_index_1` ON  `myems_user_db`.`tbl_action_logs`  (`user_name`, `date_time_utc`, `action`);
