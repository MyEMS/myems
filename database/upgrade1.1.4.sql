
DROP TABLE myems_fdd_db.tbl_sms_recipients;

CREATE TABLE IF NOT EXISTS `myems_reporting_db`.`tbl_email_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `recipient_name` VARCHAR(128) NOT NULL,
  `recipient_email` VARCHAR(128) NOT NULL,
  `subject` VARCHAR(128) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `attachment_file_name` VARCHAR(128) NULL,
  `attachment_file_object` LONGBLOB NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `scheduled_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, sent, timeout',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_email_messages_index_1` ON  `myems_reporting_db`.`tbl_email_messages`  (`status`,   `scheduled_datetime_utc`);

RENAME TABLE myems_historical_db.tbl_offline_cost_files TO myems_historical_db.tbl_cost_files;

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.1.4', release_date='2021-07-19' WHERE id=1;
