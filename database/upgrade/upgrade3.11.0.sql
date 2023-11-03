-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.10.0 TO 3.11.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_index_1` ON  `myems_system_db`.`tbl_photovoltaic_power_stations` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_wind_farms` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_wind_farms_index_1` ON  `myems_system_db`.`tbl_wind_farms` (`name`);


INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(1400,'Energy Storage Power Station','/energystoragepowerstation',NULL,1),
(1401,'Energy Storage Power Station Details','/energystoragepowerstationdetails',NULL,1),
(1500,'Photovoltaic Power Station','/photovoltaicpowerstation',NULL,1),
(1501,'Photovoltaic Power Station Details','/photovoltaicpowerstationdetails',NULL,1),
(1600,'Wind Farm','/windfarm',NULL,1),
(1601,'Wind Farm Details','/windfarmdetails',NULL,1);

DROP TABLE myems_system_db.tbl_microgrid_architecture_types;
DROP TABLE myems_system_db.tbl_microgrid_owner_types;
ALTER TABLE myems_system_db.tbl_microgrids DROP COLUMN architecture_type_id;
ALTER TABLE myems_system_db.tbl_microgrids DROP COLUMN owner_type_id;
ALTER TABLE myems_system_db.tbl_microgrids ADD `serial_number` VARCHAR(255) AFTER `cost_center_id`;
DROP TABLE myems_system_db.tbl_microgrids_windturbines;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `run_state_point_id` BIGINT NOT NULL AFTER `microgrid_id`;
ALTER TABLE myems_system_db.tbl_microgrids_batteries ADD `battery_state_point_id` BIGINT NOT NULL AFTER `microgrid_id`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.11.0RC', release_date='2023-11-01' WHERE id=1;

COMMIT;
