-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.9.2 TO 1.9.3
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.9.3', release_date='2022-06-03' WHERE id=1;

COMMIT;
