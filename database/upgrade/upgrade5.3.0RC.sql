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

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `communication_status_with_pcs_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `communication_status_with_ems_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `grid_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `total_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `total_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `soh_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `charging_power_limit_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `discharge_limit_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `rechargeable_capacity_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `dischargeable_capacity_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `average_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `average_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `insulation_value_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `positive_insulation_value_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `negative_insulation_value_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `maximum_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `maximum_temperature_battery_cell_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `minimum_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `minimum_temperature_battery_cell_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `maximum_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `maximum_voltage_battery_cell_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `minimum_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
DROP COLUMN `minimum_voltage_battery_cell_point_id`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `state_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `module_environmental_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `radiator_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `environmental_temperature_limit_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_positive_bus_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_negative_bus_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_positive_busbar_voltage_difference_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_voltage_side_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_voltage_side_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_voltage_side_dc_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_pre_charging_overvoltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_polarity_reverse_connection_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_short_circuit_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `high_voltage_side_unbalanced_busbars_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_voltage_side_undervoltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_voltage_side_overvoltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_voltage_side_overcurrent_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_voltage_side_reverse_polarity_connection_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
DROP COLUMN `low_insulation_resistance_point_id`;

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

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `total_active_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `active_power_a_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `active_power_b_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `active_power_c_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `total_reactive_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `reactive_power_a_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `reactive_power_b_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `reactive_power_c_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `total_apparent_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `apparent_power_a_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `apparent_power_b_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `apparent_power_c_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `total_power_factor_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `active_energy_import_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `active_energy_export_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
DROP COLUMN `active_energy_net_point_id`;

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

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `total_active_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `active_power_a_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `active_power_b_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `active_power_c_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `total_reactive_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `reactive_power_a_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `reactive_power_b_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `reactive_power_c_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `total_apparent_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `apparent_power_a_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `apparent_power_b_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `apparent_power_c_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `total_power_factor_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `active_energy_import_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `active_energy_export_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
DROP COLUMN `active_energy_net_point_id`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `today_charge_energy_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `today_discharge_energy_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `total_charge_energy_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `total_discharge_energy_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `grid_connection_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `device_status_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `control_mode_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `total_ac_active_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `total_ac_reactive_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `total_ac_apparent_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `total_ac_power_factor_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `ac_frequency_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_a_active_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_b_active_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_c_active_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_a_reactive_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_b_reactive_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_c_reactive_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_a_apparent_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_b_apparent_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_c_apparent_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `ab_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `bc_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `ca_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `ab_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `bc_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `ca_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_a_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_b_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_c_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_a_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_b_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `phase_c_current_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `pcs_module_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `pcs_ambient_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `a1_module_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `b1_module_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `c1_module_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `a2_module_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `b2_module_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `c2_module_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `air_inlet_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `air_outlet_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `dc_power_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `dc_voltage_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
DROP COLUMN `dc_current_point_id`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.3.0RC', release_date='2025-03-15' WHERE id=1;

COMMIT;