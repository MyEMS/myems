-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.1.6 TO 1.2.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

UPDATE myems_system_db.tbl_menus SET route='/monitoring/spaceequipments' WHERE id=1001;
UPDATE myems_system_db.tbl_menus SET route='/monitoring/combinedequipments' WHERE id=1002;
UPDATE myems_system_db.tbl_menus SET route='/monitoring/tenantequipments' WHERE id=1003;
UPDATE myems_system_db.tbl_menus SET route='/monitoring/storeequipments' WHERE id=1004;
UPDATE myems_system_db.tbl_menus SET route='/monitoring/shopfloorequipments' WHERE id=1005;


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.2.0', release_date='2021-08-08' WHERE id=1;

COMMIT;