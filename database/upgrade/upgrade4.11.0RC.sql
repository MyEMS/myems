-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.10.0 TO 4.11.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_power_conversion_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `inverter_state_point_id` BIGINT NOT NULL,
  `ab_u_point_id`  BIGINT NOT NULL,
  `bc_u_point_id`  BIGINT NOT NULL,
  `ca_u_point_id`  BIGINT NOT NULL,
  `a_u_point_id`  BIGINT NOT NULL,
  `b_u_point_id`  BIGINT NOT NULL,
  `c_u_point_id`  BIGINT NOT NULL,
  `a_i_point_id`  BIGINT NOT NULL,
  `b_i_point_id`  BIGINT NOT NULL,
  `c_i_point_id`  BIGINT NOT NULL,
  `efficiency_point_id`  BIGINT NOT NULL,
  `temperature_point_id`  BIGINT NOT NULL,
  `power_factor_point_id`  BIGINT NOT NULL,
  `elec_freq_point_id`  BIGINT NOT NULL,
  `active_power_point_id`  BIGINT NOT NULL,
  `reactive_power_point_id`  BIGINT NOT NULL,
  `day_cap_point_id`  BIGINT NOT NULL,
  `mppt_power_point_id`  BIGINT NOT NULL,
  `pv1_u_point_id`  BIGINT NOT NULL,
  `pv2_u_point_id`  BIGINT NOT NULL,
  `pv3_u_point_id`  BIGINT NOT NULL,
  `pv4_u_point_id`  BIGINT NOT NULL,
  `pv5_u_point_id`  BIGINT NOT NULL,
  `pv6_u_point_id`  BIGINT NOT NULL,
  `pv7_u_point_id`  BIGINT NOT NULL,
  `pv8_u_point_id`  BIGINT NOT NULL,
  `pv9_u_point_id`  BIGINT NOT NULL,
  `pv10_u_point_id`  BIGINT NOT NULL,
  `pv11_u_point_id`  BIGINT NOT NULL,
  `pv12_u_point_id`  BIGINT NOT NULL,
  `pv13_u_point_id`  BIGINT NOT NULL,
  `pv14_u_point_id`  BIGINT NOT NULL,
  `pv15_u_point_id`  BIGINT NOT NULL,
  `pv16_u_point_id`  BIGINT NOT NULL,
  `pv17_u_point_id`  BIGINT NOT NULL,
  `pv18_u_point_id`  BIGINT NOT NULL,
  `pv19_u_point_id`  BIGINT NOT NULL,
  `pv20_u_point_id`  BIGINT NOT NULL,
  `pv21_u_point_id`  BIGINT NOT NULL,
  `pv22_u_point_id`  BIGINT NOT NULL,
  `pv23_u_point_id`  BIGINT NOT NULL,
  `pv24_u_point_id`  BIGINT NOT NULL,
  `pv25_u_point_id`  BIGINT NOT NULL,
  `pv26_u_point_id`  BIGINT NOT NULL,
  `pv27_u_point_id`  BIGINT NOT NULL,
  `pv28_u_point_id`  BIGINT NOT NULL,
  `pv1_i_point_id`  BIGINT NOT NULL,
  `pv2_i_point_id`  BIGINT NOT NULL,
  `pv3_i_point_id`  BIGINT NOT NULL,
  `pv4_i_point_id`  BIGINT NOT NULL,
  `pv5_i_point_id`  BIGINT NOT NULL,
  `pv6_i_point_id`  BIGINT NOT NULL,
  `pv7_i_point_id`  BIGINT NOT NULL,
  `pv8_i_point_id`  BIGINT NOT NULL,
  `pv9_i_point_id`  BIGINT NOT NULL,
  `pv10_i_point_id`  BIGINT NOT NULL,
  `pv11_i_point_id`  BIGINT NOT NULL,
  `pv12_i_point_id`  BIGINT NOT NULL,
  `pv13_i_point_id`  BIGINT NOT NULL,
  `pv14_i_point_id`  BIGINT NOT NULL,
  `pv15_i_point_id`  BIGINT NOT NULL,
  `pv16_i_point_id`  BIGINT NOT NULL,
  `pv17_i_point_id`  BIGINT NOT NULL,
  `pv18_i_point_id`  BIGINT NOT NULL,
  `pv19_i_point_id`  BIGINT NOT NULL,
  `pv20_i_point_id`  BIGINT NOT NULL,
  `pv21_i_point_id`  BIGINT NOT NULL,
  `pv22_i_point_id`  BIGINT NOT NULL,
  `pv23_i_point_id`  BIGINT NOT NULL,
  `pv24_i_point_id`  BIGINT NOT NULL,
  `pv25_i_point_id`  BIGINT NOT NULL,
  `pv26_i_point_id`  BIGINT NOT NULL,
  `pv27_i_point_id`  BIGINT NOT NULL,
  `pv28_i_point_id`  BIGINT NOT NULL,
  `total_cap_point_id`  BIGINT NOT NULL,
  `open_time_point_id`  BIGINT NOT NULL,
  `close_time_point_id`  BIGINT NOT NULL,
  `mppt_total_cap_point_id`  BIGINT NOT NULL,
  `mppt_1_cap_point_id`  BIGINT NOT NULL,
  `mppt_2_cap_point_id`  BIGINT NOT NULL,
  `mppt_3_cap_point_id`  BIGINT NOT NULL,
  `mppt_4_cap_point_id`  BIGINT NOT NULL,
  `mppt_5_cap_point_id`  BIGINT NOT NULL,
  `mppt_6_cap_point_id`  BIGINT NOT NULL,
  `mppt_7_cap_point_id`  BIGINT NOT NULL,
  `mppt_8_cap_point_id`  BIGINT NOT NULL,
  `mppt_9_cap_point_id`  BIGINT NOT NULL,
  `mppt_10_cap_point_id`  BIGINT NOT NULL,
  `run_state_point_id`  BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_pcs_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_power_conversion_systems` (`photovoltaic_power_station_id`);


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

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.11.0RC', release_date='2024-11-22' WHERE id=1;

COMMIT;