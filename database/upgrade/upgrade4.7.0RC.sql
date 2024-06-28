-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.6.0 TO 4.7.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_svgs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `source_code` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_svgs_index_1` ON `myems_system_db`.`tbl_svgs` (`name`);

ALTER TABLE myems_system_db.tbl_energy_storage_power_stations ADD `svg_id` BIGINT NOT NULL AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_energy_storage_power_stations DROP COLUMN svg;

ALTER TABLE myems_system_db.tbl_microgrids ADD `svg_id` BIGINT NOT NULL AFTER `serial_number`;
ALTER TABLE myems_system_db.tbl_microgrids DROP COLUMN svg;

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(40000,'Work Order','/workorder',NULL,1),
(40001,'Work Order Installation','/workorder/installation',40000,1),
(40002,'Work Order Repair','/workorder/repair',40000,1),
(40003,'Work Order Inspection','/workorder/inspection',40000,1);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.7.0RC', release_date='2024-07-07' WHERE id=1;

COMMIT;
