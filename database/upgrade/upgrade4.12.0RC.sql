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

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.12.0RC', release_date='2024-12-12' WHERE id=1;

COMMIT;