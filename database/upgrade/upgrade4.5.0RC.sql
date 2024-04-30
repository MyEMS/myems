-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.4.0 TO 4.5.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
VALUES
(112,'Plan','/space/plan',100,0),
(213,'Plan','/equipment/plan',200,0),
(322,'Meter Plan','/meter/meterplan',300,0),
(323,'Offline Meter Plan','/meter/offlinemeterplan',300,0),
(324,'Virtual Meter Plan','/meter/virtualmeterplan',300,0),
(410,'Plan','/tenant/plan',400,0),
(509,'Plan','/store/plan',500,0),
(609,'Plan','/shopfloor/plan',600,0),
(712,'Plan','/combinedequipment/plan',700,0);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.5.0RC', release_date='2024-05-18' WHERE id=1;

COMMIT;
