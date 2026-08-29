-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.7.0升级到6.8.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.7.0 TO 6.8.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(217,'Equipment Realtime Monitor','/equipment/realtimemonitor',200,0),
(330,'Dashboard','/meter',300,0);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_emission_factors`
-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_emission_factors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `unit_of_factor` VARCHAR(45) NOT NULL COMMENT 'Unit of Factor, e.g. kgCO2/kWh',
  `valid_from_datetime_utc` DATETIME NOT NULL,
  `valid_through_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_emission_factors_index_1` ON `myems_system_db`.`tbl_emission_factors` (`name`);
CREATE INDEX `tbl_emission_factors_index_2`
ON `myems_system_db`.`tbl_emission_factors` (`energy_category_id`, `valid_from_datetime_utc`, `valid_through_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_emission_factors_timeofuses`
-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_emission_factors_timeofuses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `emission_factor_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `factor` DECIMAL(21, 6) NOT NULL COMMENT 'CO2 emission factor in this time period, e.g. kgCO2/kWh',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_emission_factors_timeofuses_index_1`
ON `myems_system_db`.`tbl_emission_factors_timeofuses` (`emission_factor_id`, `start_time_of_day`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_cost_centers_emission_factors`
-- ---------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_cost_centers_emission_factors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cost_center_id` BIGINT NOT NULL,
  `emission_factor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_cost_centers_emission_factors_index_1`
ON `myems_system_db`.`tbl_cost_centers_emission_factors` (`cost_center_id`);

UPDATE `myems_system_db`.`tbl_versions` SET version='6.8.0', release_date='2026-08-29' WHERE id=1;

COMMIT;