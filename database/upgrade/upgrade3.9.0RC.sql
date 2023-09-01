-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.8.0 TO 3.9.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_power_plants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `balancing_price_point_id` BIGINT NOT NULL,
  `svg` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_power_plants_index_1` ON  `myems_system_db`.`tbl_virtual_power_plants` (`name`);


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_power_plants_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_power_plant_id` BIGINT NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_power_plants_microgrids_index_1`
ON `myems_system_db`.`tbl_virtual_power_plants_microgrids` (`virtual_power_plant_id`);


RENAME TABLE myems_system_db.tbl_microgrids_converters TO myems_system_db.tbl_microgrids_power_conversion_systems;

ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems
RENAME INDEX tbl_microgrids_converters_index_1 TO tbl_microgrids_power_conversion_systems_index_1;

ALTER TABLE myems_reporting_db.tbl_reports DROP COLUMN category;
ALTER TABLE myems_reporting_db.tbl_reports DROP COLUMN report_code;


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_users_index_1` ON  `myems_system_db`.`tbl_microgrids_users` (`microgrid_id`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.9.0RC', release_date='2023-09-01' WHERE id=1;

COMMIT;
