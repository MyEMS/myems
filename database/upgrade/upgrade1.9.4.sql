-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.9.3 TO 1.9.4
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.9.4', release_date='2022-06-11' WHERE id=1;

-- UPDATE MENU
UPDATE `myems_system_db`.`tbl_menus` SET `name` = 'Meter Batch Analysis', `route` = '/meter/meterbatch' WHERE `id` = 310;
UPDATE `myems_system_db`.`tbl_menus` SET `route` = '/meter/metertracking' WHERE `id` = 311;

COMMIT;
