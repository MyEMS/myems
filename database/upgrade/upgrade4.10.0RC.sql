-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.9.0 TO 4.10.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_points
ADD `offset_constant` DECIMAL(18, 3) DEFAULT 0.000 NOT NULL AFTER `ratio`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.10.0RC', release_date='2024-10-18' WHERE id=1;

COMMIT;