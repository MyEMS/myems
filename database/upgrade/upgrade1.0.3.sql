-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.0.2 TO 1.0.3
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_fdd_db.tbl_web_messages MODIFY COLUMN user_id bigint NOT NULL;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'unread, read, archived',
  `subject` VARCHAR(128) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `url` VARCHAR(128),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_notifications_index_1` ON  `myems_user_db`.`tbl_notifications`  (`user_id`, `created_datetime_utc`, `status`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.0.3', release_date='2021-02-07' WHERE id=1;

COMMIT;