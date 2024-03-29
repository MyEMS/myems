-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.3.0 TO 4.4.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

UPDATE myems_system_db.tbl_menus SET route='/energystoragepowerstation/details' WHERE id=1401;

INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
VALUES
(1402, 'Energy Storage Power Station List','/energystoragepowerstation', 1400, 1),
(1403, 'Energy Storage Power Station Reporting','/energystoragepowerstation/reporting', 1400, 1),
(1404, 'Energy Storage Power Station Alarm','/energystoragepowerstation/alarm', 1400, 1),
(1405, 'Energy Storage Power Station Maintenance','/energystoragepowerstation/maintenance', 1400, 1);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.4.0RC', release_date='2024-04-10' WHERE id=1;

COMMIT;
