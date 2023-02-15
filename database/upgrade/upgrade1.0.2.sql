-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.0.1 TO 1.0.2
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- MySQL:
ALTER TABLE myems_system_db.tbl_meters CHANGE parent_meter_id master_meter_id bigint NULL;

-- SingleStore:
ALTER TABLE myems_system_db.tbl_meters CHANGE parent_meter_id master_meter_id;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.0.2', release_date='2021-01-29' WHERE id=1;

COMMIT;