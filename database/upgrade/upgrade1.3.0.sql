-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.2.3 TO 1.3.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_gsm_modems` ;


ALTER TABLE `myems_user_db`.`tbl_users` ADD `password_expiration_datetime_utc` DATETIME NOT NULL DEFAULT '2099-12-31 16:00:00' AFTER privilege_id;
ALTER TABLE `myems_user_db`.`tbl_users` ADD `account_expiration_datetime_utc` DATETIME NOT NULL DEFAULT '2099-12-31 16:00:00' AFTER privilege_id;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.3.0', release_date='2021-09-24' WHERE id=1;

COMMIT;