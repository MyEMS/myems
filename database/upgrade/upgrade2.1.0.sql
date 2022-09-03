-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 2.0.0 TO 2.1.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ADD MENUS

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(317,'Meter Saving','/meter/saving',300,0),
(318,'Offline Meter Saving','/meter/offlinemetersaving',300,0),
(319,'Virtual Meter Saving','/meter/virtualmetersaving',300,0),
(320,'Meter Comparison','/meter/metercomparison',300,0);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='2.1.0', release_date='2022-09-09' WHERE id=1;

COMMIT;