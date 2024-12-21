-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.11.0 TO 4.12.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations_invertors
ADD generation_meter_id BIGINT NOT NULL AFTER `total_energy_point_id`;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations_invertors
ADD shutdown_time_point_id BIGINT NULL AFTER `mppt_10_energy_point_id`;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations_invertors
ADD startup_time_point_id BIGINT NULL AFTER `mppt_10_energy_point_id`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_dcdcs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `state_point_id` BIGINT,
  `module_environmental_temperature_point_id` BIGINT,
  `radiator_temperature_point_id` BIGINT,
  `environmental_temperature_limit_power_point_id` BIGINT,
  `high_voltage_side_positive_bus_voltage_point_id` BIGINT,
  `high_voltage_side_negative_bus_voltage_point_id` BIGINT,
  `high_voltage_side_positive_busbar_voltage_difference_point_id` BIGINT,
  `high_voltage_side_voltage_point_id` BIGINT,
  `low_voltage_side_voltage_point_id` BIGINT,
  `low_voltage_side_current_point_id` BIGINT,
  `low_voltage_side_dc_power_point_id` BIGINT,
  `high_voltage_side_pre_charging_overvoltage_point_id` BIGINT,
  `high_voltage_side_polarity_reverse_connection_point_id` BIGINT,
  `high_voltage_side_short_circuit_point_id` BIGINT,
  `high_voltage_side_unbalanced_busbars_point_id` BIGINT,
  `low_voltage_side_undervoltage_point_id` BIGINT,
  `low_voltage_side_overvoltage_point_id` BIGINT,
  `low_voltage_side_overcurrent_point_id` BIGINT,
  `low_voltage_side_reverse_polarity_connection_point_id` BIGINT,
  `low_insulation_resistance_point_id` BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_dcdcs_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_dcdcs` (`energy_storage_container_id`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_container_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_charge_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_container_charge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_container_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_discharge_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_container_discharge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_container_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_buy_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_container_grid_buy_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_container_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_sell_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_container_grid_sell_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_container_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_load_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_container_load_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_power_station_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_charge_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_power_station_charge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_power_station_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_discharge_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_power_station_discharge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_energy_storage_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_load_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_energy_storage_power_station_load_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_microgrid_charge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_microgrid_discharge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_microgrid_evcharger_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_evcharger_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_microgrid_evcharger_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_microgrid_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_buy_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_microgrid_grid_buy_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_microgrid_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_sell_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_microgrid_grid_sell_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_microgrid_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_load_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_microgrid_load_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_microgrid_photovoltaic_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_photovoltaic_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_microgrid_photovoltaic_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_generation_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_generation_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_generation_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_load_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_load_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_container_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_charge_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_container_charge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_container_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_discharge_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_container_discharge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_container_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_buy_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_container_grid_buy_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_container_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_sell_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_container_grid_sell_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_container_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_load_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_container_load_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_power_station_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_charge_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_power_station_charge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_power_station_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_discharge_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_power_station_discharge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_energy_storage_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_load_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_energy_storage_power_station_load_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_microgrid_charge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_microgrid_discharge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_microgrid_evcharger_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_evcharger_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_microgrid_evcharger_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_microgrid_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_buy_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_microgrid_grid_buy_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_microgrid_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_sell_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_microgrid_grid_sell_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_microgrid_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_load_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_microgrid_load_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_microgrid_photovoltaic_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_photovoltaic_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_microgrid_photovoltaic_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_photovoltaic_power_station_generation_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_generation_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_photovoltaic_power_station_generation_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_photovoltaic_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_photovoltaic_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_photovoltaic_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_load_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_photovoltaic_power_station_load_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_container_charge_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_charge_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_container_charge_8760`
 (`energy_storage_container_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_container_discharge_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_discharge_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_container_discharge_8760`
 (`energy_storage_container_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_container_grid_buy_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_buy_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_container_grid_buy_8760`
 (`energy_storage_container_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_container_grid_sell_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_sell_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_container_grid_sell_8760`
 (`energy_storage_container_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_container_load_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_load_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_container_load_8760`
 (`energy_storage_container_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_power_station_charge_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_charge_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_power_station_charge_8760`
 (`energy_storage_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_power_station_discharge_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_discharge_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_power_station_discharge_8760`
 (`energy_storage_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_power_station_grid_buy_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_power_station_grid_buy_8760`
 (`energy_storage_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_power_station_grid_sell_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_power_station_grid_sell_8760`
 (`energy_storage_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_energy_storage_power_station_load_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_load_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_energy_storage_power_station_load_8760`
 (`energy_storage_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_microgrid_charge_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_microgrid_charge_8760`
 (`microgrid_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_microgrid_discharge_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_microgrid_discharge_8760`
 (`microgrid_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_microgrid_evcharger_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_evcharger_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_microgrid_evcharger_8760`
 (`microgrid_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_microgrid_grid_buy_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_buy_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_microgrid_grid_buy_8760`
 (`microgrid_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_microgrid_grid_sell_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_sell_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_microgrid_grid_sell_8760`
 (`microgrid_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_microgrid_load_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_load_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_microgrid_load_8760`
 (`microgrid_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_microgrid_photovoltaic_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_photovoltaic_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_microgrid_photovoltaic_8760`
 (`microgrid_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_photovoltaic_power_station_generation_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_generation_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_photovoltaic_power_station_generation_8760`
 (`photovoltaic_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_photovoltaic_power_station_grid_buy_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_photovoltaic_power_station_grid_buy_8760`
 (`photovoltaic_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_photovoltaic_power_station_grid_sell_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_photovoltaic_power_station_grid_sell_8760`
 (`photovoltaic_power_station_id`, `hour_of_year`);

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_photovoltaic_power_station_load_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_load_hourly_index_1`
 ON `myems_energy_model_db`.`tbl_photovoltaic_power_station_load_8760`
 (`photovoltaic_power_station_id`, `hour_of_year`);

CREATE DATABASE IF NOT EXISTS `myems_energy_prediction_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_combined_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_combined_equipment_input_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_combined_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_combined_equipment_input_item_hourly`
 (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_combined_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_combined_equipment_output_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_container_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_charge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_container_charge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_container_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_discharge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_container_discharge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_container_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_buy_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_container_grid_buy_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_container_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_sell_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_container_grid_sell_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_container_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_load_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_container_load_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_power_station_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_charge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_power_station_charge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_power_station_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_discharge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_power_station_discharge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_energy_storage_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_load_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_energy_storage_power_station_load_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_equipment_input_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_equipment_input_item_hourly`
 (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_equipment_output_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_meter_hourly`
 (`meter_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_microgrid_charge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_microgrid_discharge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_microgrid_evcharger_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_evcharger_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_microgrid_evcharger_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_microgrid_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_buy_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_microgrid_grid_buy_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_microgrid_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_sell_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_microgrid_grid_sell_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_microgrid_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_load_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_microgrid_load_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_microgrid_photovoltaic_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_photovoltaic_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_microgrid_photovoltaic_hourly`
 (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_offline_meter_hourly`
 (`offline_meter_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_generation_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_generation_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_generation_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_load_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_load_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_shopfloor_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1`
 ON  `myems_energy_prediction_db`.`tbl_shopfloor_input_category_hourly`
 (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_shopfloor_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1`
  ON `myems_energy_prediction_db`.`tbl_shopfloor_input_item_hourly`
  (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_space_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_space_input_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_space_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_space_input_item_hourly`
 (`space_id`, `energy_item_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_space_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_space_output_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_store_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_store_input_category_hourly`
 (`store_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_store_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_store_input_item_hourly`
 (`store_id`, `energy_item_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_tenant_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_tenant_input_category_hourly`
 (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_tenant_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_tenant_input_item_hourly`
 (`tenant_id`, `energy_item_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_prediction_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_energy_prediction_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

DROP DATABASE IF EXISTS `myems_billing_baseline_db` ;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.12.0', release_date='2024-12-21' WHERE id=1;

COMMIT;