-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.7.0 TO 3.8.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_microgrids_batteries` ADD `soc_point_id` BIGINT NOT NULL AFTER `microgrid_id`;

ALTER TABLE `myems_system_db`.`tbl_combined_equipments` ADD `svg` LONGTEXT NOT NULL AFTER cost_center_id;

ALTER TABLE `myems_system_db`.`tbl_combined_equipments` ADD `camera_url` VARCHAR(1000) AFTER svg;

ALTER TABLE `myems_system_db`.`tbl_equipments` ADD `svg` LONGTEXT NOT NULL AFTER cost_center_id;

ALTER TABLE `myems_system_db`.`tbl_equipments` ADD `camera_url` VARCHAR(1000) AFTER svg;

DELETE FROM myems_system_db.tbl_menus WHERE id=1003;
DELETE FROM myems_system_db.tbl_menus WHERE id=1004;
DELETE FROM myems_system_db.tbl_menus WHERE id=1005;

INSERT INTO `myems_system_db`.`tbl_menus`(`id`, `name`, `route`, `parent_menu_id`, `is_hidden`)
VALUES (321, 'Offline Meter Input', '/meter/offlinemeterinput', 300, 0);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.8.0RC', release_date='2023-08-08' WHERE id=1;

COMMIT;
