-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.1.0升级到5.2.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.1.0 TO 5.2.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;


ALTER TABLE `myems_historical_db`.`tbl_text_value_latest`
RENAME INDEX `tbl_energy_value_latest_index_1` TO `tbl_text_value_latest_index_1`;

ALTER TABLE `myems_system_db`.`tbl_tariffs_timeofuses`
MODIFY COLUMN `peak_type` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep Valley深谷'
AFTER `end_time_of_day`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_schedules`
MODIFY COLUMN `peak_type` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep-Valley深谷'
AFTER `end_time_of_day`;

ALTER TABLE `myems_system_db`.`tbl_microgrids_schedules`
MODIFY COLUMN `peak_type` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep-Valley深谷'
AFTER `end_time_of_day`;

ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12, 10) NOT NULL,
  `longitude` DECIMAL(13, 10) NOT NULL,
  `latitude_point_id` BIGINT,
  `longitude_point_id` BIGINT,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `svg2_id` BIGINT,
  `svg3_id` BIGINT,
  `svg4_id` BIGINT,
  `svg5_id` BIGINT,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_index_1` ON `myems_system_db`.`tbl_hybrid_power_stations` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_bmses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `operating_status_point_id` BIGINT NOT NULL,
  `soc_point_id` BIGINT NOT NULL,
  `soh_point_id` BIGINT NOT NULL,
  `total_voltage_point_id` BIGINT NULL,
  `total_current_point_id` BIGINT NULL,
  `maximum_cell_voltage_point_id` BIGINT NULL,
  `minimum_cell_voltage_point_id` BIGINT NULL,
  `maximum_temperature_point_id` BIGINT NULL,
  `minimum_temperature_point_id` BIGINT NULL,
  `average_temperature_point_id` BIGINT NULL,
  `insulation_value_point_id` BIGINT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_bmses_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_bmses` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_cms` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `operating_status_point_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_cms_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_cms` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_commands_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_commands` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_generators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `fuel_consumption_meter_id` BIGINT NOT NULL,
  `power_generation_meter_id` BIGINT NOT NULL,
  `operating_status_point_id` BIGINT NOT NULL,
  `power_generation_point_id` BIGINT NOT NULL,
  `phase_a_voltage_point_id` BIGINT NOT NULL,
  `phase_b_voltage_point_id` BIGINT NOT NULL,
  `phase_c_voltage_point_id` BIGINT NOT NULL,
  `phase_a_current_point_id` BIGINT NOT NULL,
  `phase_b_current_point_id` BIGINT NOT NULL,
  `phase_c_current_point_id` BIGINT NOT NULL,
  `phase_a_active_power_point_id` BIGINT NOT NULL,
  `phase_b_active_power_point_id` BIGINT NOT NULL,
  `phase_c_active_power_point_id` BIGINT NOT NULL,
  `phase_a_reactive_power_point_id` BIGINT NOT NULL,
  `phase_b_reactive_power_point_id` BIGINT NOT NULL,
  `phase_c_reactive_power_point_id` BIGINT NOT NULL,
  `power_factor_point_id` BIGINT NOT NULL,
  `genset_active_power_point_id` BIGINT NOT NULL,
  `genset_reactive_power_point_id` BIGINT NOT NULL,
  `genset_frequency_point_id` BIGINT NOT NULL,
  `engine_fuel_level_point_id` BIGINT NOT NULL,
  `engine_oil_pressure_point_id` BIGINT NOT NULL,
  `engine_coolant_temperature_point_id` BIGINT NOT NULL,
  `cumulative_engine_fuel_consumption_point_id` BIGINT NOT NULL,
  `cumulative_fuel_efficiency_point_id` BIGINT NOT NULL,
  `instantaneous_fuel_efficiency_point_id` BIGINT NOT NULL,
   PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_generators_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_generators` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `total_active_power_point_id` BIGINT NOT NULL,
  `total_reactive_power_point_id` BIGINT NOT NULL,
  `power_consumption_point_id` BIGINT NOT NULL,
  `phase_a_voltage_point_id` BIGINT NOT NULL,
  `phase_b_voltage_point_id` BIGINT NOT NULL,
  `phase_c_voltage_point_id` BIGINT NOT NULL,
  `phase_a_current_point_id` BIGINT NOT NULL,
  `phase_b_current_point_id` BIGINT NOT NULL,
  `phase_c_current_point_id` BIGINT NOT NULL,
  `phase_a_active_power_point_id` BIGINT NOT NULL,
  `phase_b_active_power_point_id` BIGINT NOT NULL,
  `phase_c_active_power_point_id` BIGINT NOT NULL,
  `phase_a_reactive_power_point_id` BIGINT NOT NULL,
  `phase_b_reactive_power_point_id` BIGINT NOT NULL,
  `phase_c_reactive_power_point_id` BIGINT NOT NULL,
  `power_factor_point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_loads_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_loads` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_mcus` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `operating_status_point_id` BIGINT NOT NULL,
  `ambient_temperature_point_id` BIGINT NOT NULL,
  `core_heatsink_temperature_point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_mcus_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_mcus` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pcses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `charge_meter_id` BIGINT NOT NULL,
  `discharge_meter_id` BIGINT NOT NULL,
  `operating_status_point_id` BIGINT NOT NULL,
  `total_charge_energy_point_id` BIGINT NOT NULL,
  `total_discharge_energy_point_id` BIGINT NOT NULL,
  `phase_a_voltage_point_id` BIGINT NOT NULL,
  `phase_b_voltage_point_id` BIGINT NOT NULL,
  `phase_c_voltage_point_id` BIGINT NOT NULL,
  `phase_a_current_point_id` BIGINT NOT NULL,
  `phase_b_current_point_id` BIGINT NOT NULL,
  `phase_c_current_point_id` BIGINT NOT NULL,
  `phase_a_active_power_point_id` BIGINT NOT NULL,
  `phase_b_active_power_point_id` BIGINT NOT NULL,
  `phase_c_active_power_point_id` BIGINT NOT NULL,
  `phase_a_reactive_power_point_id` BIGINT NOT NULL,
  `phase_b_reactive_power_point_id` BIGINT NOT NULL,
  `phase_c_reactive_power_point_id` BIGINT NOT NULL,
  `power_factor_point_id` BIGINT NOT NULL,
  `ambient_temperature_point_id` BIGINT NOT NULL,
  `core_heatsink_temperature_point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_pcses_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_pcses` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pvs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `operating_status_point_id` BIGINT NOT NULL,
  `active_power_point_id` BIGINT NULL,
  `reactive_power_point_id` BIGINT NULL,
  `daily_power_generation_point_id` BIGINT NULL,
  `total_power_generation_point_id` BIGINT NULL,
  `ambient_temperature_point_id` BIGINT NULL,
  `core_heatsink_temperature_point_id` BIGINT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_pvs_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_pvs` (`hybrid_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_users_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_users` (`hybrid_power_station_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.2.0RC', release_date='2025-02-15' WHERE id=1;

COMMIT;