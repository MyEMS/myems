-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.10.0 TO 4.11.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_invertors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `model` VARCHAR(255) NOT NULL,
  `serial_number` VARCHAR(255) NOT NULL,
  `invertor_state_point_id` BIGINT NOT NULL,
  `communication_state_point_id`  BIGINT NOT NULL,
  `total_energy_point_id`  BIGINT NOT NULL,
  `today_energy_point_id`  BIGINT,
  `efficiency_point_id`  BIGINT,
  `temperature_point_id`  BIGINT,
  `power_factor_point_id`  BIGINT,
  `active_power_point_id`  BIGINT,
  `reactive_power_point_id`  BIGINT,
  `frequency_point_id`  BIGINT,
  `uab_point_id`  BIGINT,
  `ubc_point_id`  BIGINT,
  `uca_point_id`  BIGINT,
  `ua_point_id`  BIGINT,
  `ub_point_id`  BIGINT,
  `uc_point_id`  BIGINT,
  `ia_point_id`  BIGINT,
  `ib_point_id`  BIGINT,
  `ic_point_id`  BIGINT,
  `pv1_u_point_id`  BIGINT,
  `pv1_i_point_id`  BIGINT,
  `pv2_u_point_id`  BIGINT,
  `pv2_i_point_id`  BIGINT,
  `pv3_u_point_id`  BIGINT,
  `pv3_i_point_id`  BIGINT,
  `pv4_u_point_id`  BIGINT,
  `pv4_i_point_id`  BIGINT,
  `pv5_u_point_id`  BIGINT,
  `pv5_i_point_id`  BIGINT,
  `pv6_u_point_id`  BIGINT,
  `pv6_i_point_id`  BIGINT,
  `pv7_u_point_id`  BIGINT,
  `pv7_i_point_id`  BIGINT,
  `pv8_u_point_id`  BIGINT,
  `pv8_i_point_id`  BIGINT,
  `pv9_u_point_id`  BIGINT,
  `pv9_i_point_id`  BIGINT,
  `pv10_u_point_id`  BIGINT,
  `pv10_i_point_id`  BIGINT,
  `pv11_u_point_id`  BIGINT,
  `pv11_i_point_id`  BIGINT,
  `pv12_u_point_id`  BIGINT,
  `pv12_i_point_id`  BIGINT,
  `pv13_u_point_id`  BIGINT,
  `pv13_i_point_id`  BIGINT,
  `pv14_u_point_id`  BIGINT,
  `pv14_i_point_id`  BIGINT,
  `pv15_u_point_id`  BIGINT,
  `pv15_i_point_id`  BIGINT,
  `pv16_u_point_id`  BIGINT,
  `pv16_i_point_id`  BIGINT,
  `pv17_u_point_id`  BIGINT,
  `pv17_i_point_id`  BIGINT,
  `pv18_u_point_id`  BIGINT,
  `pv18_i_point_id`  BIGINT,
  `pv19_u_point_id`  BIGINT,
  `pv19_i_point_id`  BIGINT,
  `pv20_u_point_id`  BIGINT,
  `pv20_i_point_id`  BIGINT,
  `pv21_u_point_id`  BIGINT,
  `pv21_i_point_id`  BIGINT,
  `pv22_u_point_id`  BIGINT,
  `pv22_i_point_id`  BIGINT,
  `pv23_u_point_id`  BIGINT,
  `pv23_i_point_id`  BIGINT,
  `pv24_u_point_id`  BIGINT,
  `pv24_i_point_id`  BIGINT,
  `pv25_u_point_id`  BIGINT,
  `pv25_i_point_id`  BIGINT,
  `pv26_u_point_id`  BIGINT,
  `pv26_i_point_id`  BIGINT,
  `pv27_u_point_id`  BIGINT,
  `pv27_i_point_id`  BIGINT,
  `pv28_u_point_id`  BIGINT,
  `pv28_i_point_id`  BIGINT,
  `mppt_total_energy_point_id`  BIGINT,
  `mppt_power_point_id`  BIGINT,
  `mppt_1_energy_point_id`  BIGINT,
  `mppt_2_energy_point_id`  BIGINT,
  `mppt_3_energy_point_id`  BIGINT,
  `mppt_4_energy_point_id`  BIGINT,
  `mppt_5_energy_point_id`  BIGINT,
  `mppt_6_energy_point_id`  BIGINT,
  `mppt_7_energy_point_id`  BIGINT,
  `mppt_8_energy_point_id`  BIGINT,
  `mppt_9_energy_point_id`  BIGINT,
  `mppt_10_energy_point_id`  BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_invertors_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_invertors` (`photovoltaic_power_station_id`);


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `total_active_power_point_id` BIGINT,
  `active_power_a_point_id` BIGINT,
  `active_power_b_point_id` BIGINT,
  `active_power_c_point_id` BIGINT,
  `total_reactive_power_point_id` BIGINT,
  `reactive_power_a_point_id` BIGINT,
  `reactive_power_b_point_id` BIGINT,
  `reactive_power_c_point_id` BIGINT,
  `total_apparent_power_point_id` BIGINT,
  `apparent_power_a_point_id` BIGINT,
  `apparent_power_b_point_id` BIGINT,
  `apparent_power_c_point_id` BIGINT,
  `total_power_factor_point_id` BIGINT,
  `active_energy_import_point_id` BIGINT,
  `active_energy_export_point_id` BIGINT,
  `active_energy_net_point_id` BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_grids_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_grids` (`photovoltaic_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(18, 3) NOT NULL,
  `total_active_power_point_id` BIGINT,
  `active_power_a_point_id` BIGINT,
  `active_power_b_point_id` BIGINT,
  `active_power_c_point_id` BIGINT,
  `total_reactive_power_point_id` BIGINT,
  `reactive_power_a_point_id` BIGINT,
  `reactive_power_b_point_id` BIGINT,
  `reactive_power_c_point_id` BIGINT,
  `total_apparent_power_point_id` BIGINT,
  `apparent_power_a_point_id` BIGINT,
  `apparent_power_b_point_id` BIGINT,
  `apparent_power_c_point_id` BIGINT,
  `total_power_factor_point_id` BIGINT,
  `active_energy_import_point_id` BIGINT,
  `active_energy_export_point_id` BIGINT,
  `active_energy_net_point_id` BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_loads_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_loads` (`photovoltaic_power_station_id`);

ALTER TABLE myems_system_db.tbl_data_sources MODIFY COLUMN protocol varchar(128) NOT NULL;

ALTER TABLE myems_system_db.tbl_data_sources ADD process_id BIGINT NULL AFTER `connection`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_photovoltaic_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_photovoltaic_power_stations`
ON `myems_system_db`.`tbl_spaces_photovoltaic_power_stations` (`space_id`);

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations
ADD station_code VARCHAR(255) NOT NULL AFTER uuid;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations
ADD rated_capacity DECIMAL(18, 3) NOT NULL AFTER longitude;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations
ADD phase_of_lifecycle VARCHAR(255) NOT NULL AFTER svg_id;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations
ADD is_cost_data_displayed BOOL NOT NULL AFTER svg_id;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_charging_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `rated_capacity` DECIMAL(18, 3) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_charging_stations_index_1` ON `myems_system_db`.`tbl_charging_stations` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_charging_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `charging_station_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_charging_stations_index_1`
ON `myems_system_db`.`tbl_spaces_charging_stations` (`space_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_wind_farms` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `wind_farm_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_wind_farms_index_1` ON `myems_system_db`.`tbl_spaces_wind_farms` (`space_id`);

ALTER TABLE myems_system_db.tbl_energy_storage_containers DROP COLUMN svg_id;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_users_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_users` (`photovoltaic_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_photovoltaic_power_station_generation_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_generation_hourly_index_1`
 ON `myems_energy_db`.`tbl_photovoltaic_power_station_generation_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_photovoltaic_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_photovoltaic_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_photovoltaic_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_load_hourly_index_1`
 ON `myems_energy_db`.`tbl_photovoltaic_power_station_load_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_photovoltaic_power_station_generation_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_generation_hourly_index_1`
 ON `myems_billing_db`.`tbl_photovoltaic_power_station_generation_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_photovoltaic_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_buy_hourly_index_1`
 ON `myems_billing_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_photovoltaic_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_sell_hourly_index_1`
 ON `myems_billing_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_photovoltaic_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_load_hourly_index_1`
 ON `myems_billing_db`.`tbl_photovoltaic_power_station_load_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_photovoltaic_power_station_generation_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_generation_hourly_index_1`
 ON `myems_carbon_db`.`tbl_photovoltaic_power_station_generation_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_photovoltaic_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_buy_hourly_index_1`
 ON `myems_carbon_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_photovoltaic_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_grid_sell_hourly_index_1`
 ON `myems_carbon_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_photovoltaic_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_station_load_hourly_index_1`
 ON `myems_carbon_db`.`tbl_photovoltaic_power_station_load_hourly`
 (`photovoltaic_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_container_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_buy_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_container_grid_buy_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_container_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_sell_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_container_grid_sell_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_container_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_load_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_container_load_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_buy_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_sell_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_load_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_power_station_load_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_container_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_buy_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_container_grid_buy_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_container_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_sell_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_container_grid_sell_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_container_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_load_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_container_load_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_buy_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_sell_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_load_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_power_station_load_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_container_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_buy_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_container_grid_buy_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_container_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_grid_sell_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_container_grid_sell_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_container_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_load_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_container_load_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_power_station_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_buy_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_power_station_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_grid_sell_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_power_station_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_load_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_power_station_load_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.11.0RC', release_date='2024-11-22' WHERE id=1;

COMMIT;