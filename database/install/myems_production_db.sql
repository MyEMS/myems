-- MyEMS Production Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_production_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_production_db` ;
CREATE DATABASE IF NOT EXISTS `myems_production_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_production_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_products`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_products` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `unit_of_measure` VARCHAR(32) NOT NULL,
  `tag` VARCHAR(128) NOT NULL,
  `standard_product_coefficient` DECIMAL(18, 3) NOT NULL DEFAULT 1.0,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_products_index_1` ON `myems_production_db`.`tbl_products` (`name`);

-- --------------------------------------------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shifts`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shifts` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shifts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `team_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_count` INT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `end_datetime_utc` DATETIME NOT NULL,
  `reference_timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shifts_index_1`
ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `product_id`, `end_datetime_utc`);
CREATE INDEX `tbl_shifts_index_2`
ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `product_id`, `start_datetime_utc`, `end_datetime_utc` );
CREATE INDEX `tbl_shifts_index_3` ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `reference_timestamp`);
CREATE INDEX `tbl_shifts_index_4` ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `team_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shopfloor_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shopfloor_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shopfloor_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_count` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_hourly_index_1`
ON `myems_production_db`.`tbl_shopfloor_hourly` (`shopfloor_id`, `product_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shopfloors_products`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shopfloors_products` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shopfloors_products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shopfloors_teams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shopfloors_teams` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shopfloors_teams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `team_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_space_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_space_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_space_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_count` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_hourly_index_1`
ON `myems_production_db`.`tbl_space_hourly` (`space_id`, `product_id`, `start_datetime_utc`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_teams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_teams` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_teams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_teams_index_1` ON `myems_production_db`.`tbl_teams`   (`name`);
