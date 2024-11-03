-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.9.1 TO 4.10.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_spaces
ADD `number_of_occupants` DECIMAL(18, 3) NOT NULL DEFAULT 1.000 AFTER `area`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_distribution_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `distribution_system_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_distribution_systems_index_1` ON `myems_system_db`.`tbl_spaces_distribution_systems` (`space_id`);

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
RENAME INDEX tbl_energy_storage_containers_grids_index_1 TO tbl_energy_storage_containers_loads_index_1;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.10.0', release_date='2024-10-26' WHERE id=1;

COMMIT;