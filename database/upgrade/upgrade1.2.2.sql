DROP TABLE IF EXISTS `myems_user_db`.`tbl_logs` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `request_datetime_utc` DATETIME NOT NULL,
  `request_method` VARCHAR(256) NOT NULL,
  `resource_type` VARCHAR(256) NOT NULL,
  `resource_id` BIGINT NULL,
  `request_body` JSON NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_logs_index_1` ON  `myems_user_db`.`tbl_logs`  (`user_id`, `request_datetime_utc`, `request_method`);

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.2.2', release_date='2021-08-28' WHERE id=1;
