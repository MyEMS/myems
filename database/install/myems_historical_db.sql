-- MyEMS Historical Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_historical_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_historical_db` ;
CREATE DATABASE IF NOT EXISTS `myems_historical_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_historical_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_analog_value`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_analog_value` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_analog_value` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  `is_bad` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_analog_value_index_1` ON `myems_historical_db`.`tbl_analog_value` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_analog_value_index_2` ON `myems_historical_db`.`tbl_analog_value` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_analog_value_latest`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_analog_value_latest` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_analog_value_latest` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_analog_value_latest_index_1`
ON `myems_historical_db`.`tbl_analog_value_latest` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_analog_value_latest_index_2` ON `myems_historical_db`.`tbl_analog_value_latest` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_cost_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_cost_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_cost_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_digital_value`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_digital_value` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_digital_value` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` INT NOT NULL,
  `is_bad` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_digital_value_index_1` ON `myems_historical_db`.`tbl_digital_value` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_digital_value_index_2` ON `myems_historical_db`.`tbl_digital_value` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_digital_value_latest`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_digital_value_latest` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_digital_value_latest` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` INT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_digital_value_latest_index_1`
ON `myems_historical_db`.`tbl_digital_value_latest` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_digital_value_latest_index_2` ON `myems_historical_db`.`tbl_digital_value_latest` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_energy_value`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_energy_value` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_energy_value` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  `is_bad` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_value_index_1` ON `myems_historical_db`.`tbl_energy_value` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_energy_value_index_2` ON `myems_historical_db`.`tbl_energy_value` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_energy_value_latest`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_energy_value_latest` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_energy_value_latest` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_value_latest_index_1`
ON `myems_historical_db`.`tbl_energy_value_latest` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_energy_value_latest_index_2` ON `myems_historical_db`.`tbl_energy_value_latest` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_offline_meter_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_offline_meter_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_offline_meter_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_data_repair_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_data_repair_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_data_repair_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_energy_plan_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_energy_plan_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_energy_plan_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));

COMMIT;
