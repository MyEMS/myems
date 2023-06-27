-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.6.0 TO 3.7.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- UPDATE MENU
UPDATE `myems_system_db`.`tbl_menus`
SET `is_hidden` = 1
WHERE `id` IN (109, 209, 317, 318, 319, 406, 506, 606, 709, 803, 900, 1000, 1100);

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(1300,'Microgrid','/microgrid',NULL,1);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.7.0RC', release_date='2023-07-01' WHERE id=1;

COMMIT;
