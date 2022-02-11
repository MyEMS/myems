-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.7.0 TO 1.7.1
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_user_db`.`tbl_users`
MODIFY COLUMN `failed_login_count` int(11) NOT NULL DEFAULT 0 AFTER `password_expiration_datetime_utc`;

ALTER TABLE `myems_fdd_db`.`tbl_web_messages`
MODIFY COLUMN `status` varchar(32) NOT NULL COMMENT 'new, acknowledged, read' AFTER `created_datetime_utc`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.7.1', release_date='2022-02-11' WHERE id=1;

COMMIT;