-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.4.0 TO 3.5.0RC
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_tariffs MODIFY COLUMN tariff_type varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Tariff Type: timeofuse - Time of Use Pricing分时费率(单一费率按平设置)';

DELETE FROM myems_system_db.tbl_tariffs WHERE tariff_type  = 'block';

DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs_blocks` ;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.5.0', release_date='2023-06-06' WHERE id=1;

COMMIT;