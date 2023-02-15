-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.9.4 TO 1.9.5
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_reporting_db`.`tbl_template_files`
-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `myems_reporting_db`.`tbl_template_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `report_id` BIGINT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(45) NOT NULL COMMENT 'file_type: xlsx, pdf or docx',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_template_files_index_1` ON  `myems_reporting_db`.`tbl_template_files`  (`file_name`);
  CREATE INDEX `tbl_template_files_index_2` ON  `myems_reporting_db`.`tbl_template_files`  (`report_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_integrators`
-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_integrators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `high_temperature_point_id` BIGINT NOT NULL,
  `low_temperature_point_id` BIGINT NOT NULL,
  `flow_point_id` BIGINT NOT NULL,
  `heat_capacity` DECIMAL(18, 3) NOT NULL,
  `liquid_density` DECIMAL(18, 3) NOT NULL,
  `coefficient` DECIMAL(18, 3) NOT NULL,
  `result_point_id` BIGINT NOT NULL,
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_integrators_index_1` ON `myems_system_db`.`tbl_integrators` (`name`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_data_repair_files`
-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_data_repair_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.9.5', release_date='2022-07-18' WHERE id=1;

COMMIT;
