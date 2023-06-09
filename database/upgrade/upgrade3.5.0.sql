-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.4.0 TO 3.5.0RC
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_tariffs MODIFY COLUMN tariff_type varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Tariff Type: timeofuse - Time of Use Pricing分时费率(单一费率按平设置)';

DELETE FROM myems_system_db.tbl_tariffs WHERE tariff_type  = 'block';

DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs_blocks` ;

ALTER TABLE `myems_system_db`.`tbl_microgrids` ADD `postal_code` VARCHAR(16) NOT NULL AFTER `address`;


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_evchargers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_evchargers_index_1` ON  `myems_system_db`.`tbl_microgrids_evchargers`   (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_generators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_generators_index_1` ON  `myems_system_db`.`tbl_microgrids_generators`   (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_grids_index_1` ON  `myems_system_db`.`tbl_microgrids_grids`   (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_heatpumps` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_heatpumps_index_1` ON  `myems_system_db`.`tbl_microgrids_heatpumps`   (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_grids_index_1` ON  `myems_system_db`.`tbl_microgrids_loads`   (`name`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.5.0', release_date='2023-06-09' WHERE id=1;

COMMIT;