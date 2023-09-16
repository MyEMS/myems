-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.9.0 TO 3.10.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_gateways` ADD `description` VARCHAR(255) AFTER `last_seen_datetime_utc`;
ALTER TABLE `myems_system_db`.`tbl_data_sources` ADD `description` VARCHAR(255) AFTER `last_seen_datetime_utc`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.10.0RC', release_date='2023-10-01' WHERE id=1;

COMMIT;
