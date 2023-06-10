-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.5.0 TO 3.6.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_windturbines` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_windturbines_index_1` ON  `myems_system_db`.`tbl_microgrids_windturbines` (`name`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.6.0RC', release_date='2023-06-18' WHERE id=1;

COMMIT;