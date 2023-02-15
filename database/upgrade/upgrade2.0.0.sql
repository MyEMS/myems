-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.9.6 TO 2.0.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ADD MENUS

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(110,'Carbon','/space/carbon',100,0),
(212,'Carbon','/equipment/carbon',200,0),
(409,'Carbon','/tenant/carbon',400,0),
(508,'Carbon','/store/carbon',500,0),
(608,'Carbon','/shopfloor/carbon',600,0),
(711,'Carbon','/combinedequipment/carbon',700,0);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='2.0.0', release_date='2022-08-18' WHERE id=1;

COMMIT;