-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.3.0升级到5.4.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.3.0 TO 5.4.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_charging_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_hybrid_power_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
DROP COLUMN `postal_code`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_control_modes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `is_active` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_control_modes_index_1` ON `myems_system_db`.`tbl_control_modes` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_control_modes_times` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `control_mode_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `power_value` DECIMAL(21, 6),
  `power_point_id` BIGINT,
  `power_equation` LONGTEXT COMMENT 'MUST be in json format or NULL',
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_control_modes_times_index_1` ON `myems_system_db`.`tbl_control_modes_times` (`control_mode_id`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_charge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_hybrid_power_station_charge_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_discharge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_hybrid_power_station_discharge_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_fuel_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_fuel_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_hybrid_power_station_fuel_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_hybrid_power_station_grid_buy_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_hybrid_power_station_grid_sell_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_load_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_hybrid_power_station_load_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);


ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `commissioning_date` DATE AFTER `phase_of_lifecycle`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `commissioning_date` DATE AFTER `phase_of_lifecycle`;

ALTER TABLE `myems_system_db`.`tbl_hybrid_power_stations`
ADD COLUMN `commissioning_date` DATE AFTER `phase_of_lifecycle`;

ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `commissioning_date` DATE AFTER `phase_of_lifecycle`;

ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `commissioning_date` DATE AFTER `phase_of_lifecycle`;

RENAME TABLE `myems_system_db`.`tbl_integrators` TO `myems_system_db`.`tbl_heat_integrators`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_power_integrators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `result_point_id` BIGINT NOT NULL,
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_power_integrators_index_1` ON `myems_system_db`.`tbl_power_integrators` (`name`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.4.0RC', release_date='2025-04-25' WHERE id=1;

COMMIT;