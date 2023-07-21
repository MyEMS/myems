-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.7.0 TO 3.8.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_microgrids_batteries` ADD `soc_point_id` BIGINT NOT NULL AFTER `microgrid_id`;

ALTER TABLE `myems_system_db`.`tbl_combined_equipments` ADD `svg` LONGTEXT NOT NULL AFTER cost_center_id;

ALTER TABLE `myems_system_db`.`tbl_equipments` ADD `svg` LONGTEXT NOT NULL AFTER cost_center_id;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.8.0RC', release_date='2023-08-08' WHERE id=1;

COMMIT;
