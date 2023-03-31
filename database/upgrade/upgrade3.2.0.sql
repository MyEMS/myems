
-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.1.0 TO 3.2.0RC
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS `myems_production_db`.`tbl_shopfloor_working_days` ;

-- ADD MENUS
INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(111,'Environment Monitor','/space/environmentmonitor',100,0);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.2.0', release_date='2023-03-31' WHERE id=1;
