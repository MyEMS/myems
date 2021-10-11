
-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_reporting_db`.`tbl_reports`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_reporting_db`.`tbl_reports` ;

CREATE TABLE IF NOT EXISTS `myems_reporting_db`.`tbl_reports` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `category` VARCHAR(128) NOT NULL COMMENT 'SPACE, METER, VIRTUALMETER, TENANT, STORE, SHOPFLOOR, EQUIPMENT, COMBINEDEQUIPMENT',
  `report_code` VARCHAR(128) NOT NULL COMMENT 'SPACE01, SPACE02, ... METER01, METER02, ... TENANT01, TENANT02, ...',
  `expression` JSON NOT NULL COMMENT 'JSON string of reporting objects, peroids, date ranges, and recipients',
  `is_enabled` BOOL NOT NULL,
  `last_run_datetime_utc` DATETIME,
  `next_run_datetime_utc` DATETIME,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_reports_index_1` ON  `myems_reporting_db`.`tbl_reports` (`name`);

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.2.3', release_date='2021-09-04' WHERE id=1;
