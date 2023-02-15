-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.5.0 TO 1.5.1
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_user_db`.`tbl_users` ADD `failed_login_count` INT NOT NULL DEFAULT 0 AFTER password_expiration_datetime_utc;

ALTER TABLE `myems_user_db`.`tbl_privileges` MODIFY COLUMN `data` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format';

ALTER TABLE `myems_user_db`.`tbl_logs` MODIFY COLUMN `request_body` LONGTEXT NULL COMMENT 'MUST be in JSON format';

ALTER TABLE `myems_fdd_db`.`tbl_rules` MODIFY COLUMN `expression` LONGTEXT NULL COMMENT 'MUST be in JSON format';

ALTER TABLE `myems_fdd_db`.`tbl_wechat_messages_outbox` MODIFY COLUMN `message_data` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format';

ALTER TABLE `myems_reporting_db`.`tbl_reports` MODIFY COLUMN `expression` LONGTEXT NULL COMMENT 'MUST be in JSON format';

ALTER TABLE `myems_system_db`.`tbl_data_sources` MODIFY COLUMN `connection` LONGTEXT NULL COMMENT 'MUST be in JSON format';

ALTER TABLE `myems_system_db`.`tbl_points` MODIFY COLUMN `address` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format';

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.5.1', release_date='2021-12-18' WHERE id=1;

COMMIT;