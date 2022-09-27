-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 2.3.0 TO 2.4.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='2.4.0', release_date='2022-09-30' WHERE id=1;

DELETE FROM myems_system_db.tbl_menus WHERE id=901;
DELETE FROM myems_system_db.tbl_menus WHERE id=902;
DELETE FROM myems_system_db.tbl_menus WHERE id=903;
DELETE FROM myems_system_db.tbl_menus WHERE id=904;
DELETE FROM myems_system_db.tbl_menus WHERE id=905;
DELETE FROM myems_system_db.tbl_menus WHERE id=906;

COMMIT;