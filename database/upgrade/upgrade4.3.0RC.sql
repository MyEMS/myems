-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.2.0 TO 4.3.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- rename index
ALTER TABLE myems_system_db.tbl_microgrids_loads DROP INDEX tbl_microgrids_grids_index_1;
CREATE INDEX `tbl_microgrids_loads_index_1` ON `myems_system_db`.`tbl_microgrids_loads` (`microgrid_id`);

-- rename columns
ALTER TABLE myems_system_db.tbl_energy_storage_containers CHANGE capacity rated_capacity decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries CHANGE capacity rated_capacity decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems CHANGE capacity rated_output_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads CHANGE capacity rated_input_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_energy_storage_power_stations CHANGE capacity rated_capacity decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids CHANGE capacity rated_capacity decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids_batteries CHANGE capacity rated_capacity decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems CHANGE capacity rated_output_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids_evchargers CHANGE capacity rated_output_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids_generators CHANGE capacity rated_output_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids_heatpumps CHANGE capacity rated_input_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids_loads CHANGE capacity rated_input_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_microgrids_photovoltaics CHANGE capacity rated_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations CHANGE capacity rated_power decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_wind_farms CHANGE capacity rated_power decimal(18,3) NOT NULL;

-- add columns
ALTER TABLE myems_system_db.tbl_energy_storage_containers ADD rated_power decimal(18,3) NOT NULL AFTER rated_capacity;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries ADD rated_power decimal(18,3) NOT NULL AFTER rated_capacity;
ALTER TABLE myems_system_db.tbl_energy_storage_power_stations ADD rated_power decimal(18,3) NOT NULL AFTER rated_capacity;
ALTER TABLE myems_system_db.tbl_microgrids ADD rated_power decimal(18,3) NOT NULL AFTER rated_capacity;
ALTER TABLE myems_system_db.tbl_microgrids_batteries ADD rated_power decimal(18,3) NOT NULL AFTER rated_capacity;

-- add tables
CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_microgrids_index_1` ON `myems_system_db`.`tbl_spaces_microgrids` (`space_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_energy_storage_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_energy_storage_power_stations_index_1`
ON `myems_system_db`.`tbl_spaces_energy_storage_power_stations` (`space_id`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.3.0RC', release_date='2024-03-01' WHERE id=1;

COMMIT;
