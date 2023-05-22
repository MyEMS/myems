-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.2.0 TO 3.3.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_points` ADD `is_in_alarm` DECIMAL(18, 3) NULL COMMENT 'Used in FDD Service' AFTER `low_limit`;
ALTER TABLE `myems_system_db`.`tbl_points` ADD `lower_limit` DECIMAL(18, 3) NULL COMMENT 'Used in FDD Service' AFTER `low_limit`;
ALTER TABLE `myems_system_db`.`tbl_points` ADD `higher_limit` DECIMAL(18, 3) NULL COMMENT 'Used in FDD Service' AFTER `low_limit`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.3.0', release_date='2023-05-21' WHERE id=1;

COMMIT;