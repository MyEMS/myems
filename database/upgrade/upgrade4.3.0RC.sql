-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.2.0 TO 4.3.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_microgrids_loads DROP INDEX tbl_microgrids_grids_index_1;
CREATE INDEX `tbl_microgrids_loads_index_1` ON `myems_system_db`.`tbl_microgrids_loads` (`microgrid_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.3.0RC', release_date='2024-03-01' WHERE id=1;

COMMIT;
