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

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.9.0RC', release_date='2023-09-01' WHERE id=1;

COMMIT;
