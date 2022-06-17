-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.9.3 TO 1.9.4
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.9.4', release_date='2022-06-18' WHERE id=1;

-- UPDATE MENU
UPDATE `myems_system_db`.`tbl_menus` SET `name` = 'Meter Batch Analysis', `route` = '/meter/meterbatch' WHERE `id` = 310;
UPDATE `myems_system_db`.`tbl_menus` SET `route` = '/meter/metertracking' WHERE `id` = 311;


INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(314,'Virtual Meter Batch Analysis','/meter/virtualmeterbatch',300,0),
(315,'Offline Meter Batch Analysis','/meter/offlinemeterbatch',300,0),
(316,'Offline Meter Carbon','/meter/offlinemetercarbon',300,0);

COMMIT;
