-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.2.0升级到5.3.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.2.0 TO 5.3.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_bmses_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_bmses_points` (`bms_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pcses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pcs_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_pcses_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_pcses_points` (`pcs_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pvs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pv_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_pvs_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_pvs_points` (`pv_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_generators_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `generator_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_generators_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_generators_points` (`generator_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_cms_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cm_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_cms_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_cms_points` (`cm_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_loads_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_loads_points` (`load_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_bmses_points_index_1`
ON `myems_system_db`.`tbl_microgrids_bmses_points` (`bms_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_pcses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pcs_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_pcses_points_index_1`
ON `myems_system_db`.`tbl_microgrids_pcses_points` (`pcs_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_evchargers_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `evcharger_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_evchargers_points_index_1`
ON `myems_system_db`.`tbl_microgrids_evchargers_points` (`evcharger_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_generators_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `generator_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_generators_points_index_1`
ON `myems_system_db`.`tbl_microgrids_generators_points` (`generator_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_grids_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `grid_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_grids_points_index_1`
ON `myems_system_db`.`tbl_microgrids_grids_points` (`grid_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_heatpumps_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `heatpump_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_heatpumps_points_index_1`
ON `myems_system_db`.`tbl_microgrids_heatpumps_points` (`heatpump_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_loads_points_index_1`
ON `myems_system_db`.`tbl_microgrids_loads_points` (`load_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_pvs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pv_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_pvs_points_index_1`
ON `myems_system_db`.`tbl_microgrids_pvs_points` (`pv_id`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_hybrid_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_buy_hourly_index_1`
 ON `myems_billing_db`.`tbl_hybrid_power_station_grid_buy_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_hybrid_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_sell_hourly_index_1`
 ON `myems_billing_db`.`tbl_hybrid_power_station_grid_sell_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_hybrid_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_load_hourly_index_1`
 ON `myems_billing_db`.`tbl_hybrid_power_station_load_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_buy_hourly_index_1`
 ON `myems_carbon_db`.`tbl_hybrid_power_station_grid_buy_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_sell_hourly_index_1`
 ON `myems_carbon_db`.`tbl_hybrid_power_station_grid_sell_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_load_hourly_index_1`
 ON `myems_carbon_db`.`tbl_hybrid_power_station_load_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_hybrid_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_db`.`tbl_hybrid_power_station_grid_buy_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_hybrid_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_db`.`tbl_hybrid_power_station_grid_sell_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_hybrid_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hybrid_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_station_load_hourly_index_1`
 ON `myems_energy_db`.`tbl_hybrid_power_station_load_hourly`
 (`hybrid_power_station_id`, `start_datetime_utc`);

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(115,'Prediction','/space/prediction',100,1);


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_bmses_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_bmses_points` (`bms_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_dcdcs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `dcdc_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_dcdcs_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_dcdcs_points` (`dcdc_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_firecontrols_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `firecontrol_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_firecontrols_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_firecontrols_points` (`firecontrol_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `grid_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_grids_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_grids_points` (`grid_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_hvacs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hvac_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_hvacs_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_hvacs_points` (`hvac_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_loads_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_loads_points` (`load_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_pcses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pcs_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_pcses_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_pcses_points` (`pcs_id`);

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `working_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `indoor_fan_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `outdoor_fan_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `emergency_fan_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `compressor_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `electric_heating_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `coil_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `temperature_outside_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `temperature_inside_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `humidity_inside_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `condensation_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `defrosting_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `outlet_air_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `return_air_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `exhaust_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `heating_on_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `heating_off_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `heating_control_hysteresis_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `cooling_on_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `cooling_off_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `cooling_control_hysteresis_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `high_temperature_alarm_set_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `low_temperature_alarm_set_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
DROP COLUMN `high_humidity_alarm_set_point_id`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `water_immersion_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `emergency_stop_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `electrical_compartment_smoke_detector_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `battery_compartment_door_open_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `electrical_compartment_door_open_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `first_level_fire_alarm_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `second_level_fire_alarm_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `running_light_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `fault_light_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `ac_relay_tripping_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `inside_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `outside_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `temperature_alarm_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `smoke_sensor_value_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `smoke_sensor_alarm_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `battery_safety_detection_sensor_value_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `battery_safety_detection_sensor_alarm_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
DROP COLUMN `fire_extinguishing_device_status_point_id`;
-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.3.0RC', release_date='2025-03-15' WHERE id=1;

COMMIT;