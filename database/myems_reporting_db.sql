-- MyEMS Reporting Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_reporting_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_reporting_db` ;
CREATE DATABASE IF NOT EXISTS `myems_reporting_db` ;
USE `myems_reporting_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_reporting_db`.`tbl_reports_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_reporting_db`.`tbl_reports_files` ;

CREATE TABLE IF NOT EXISTS `myems_reporting_db`.`tbl_reports_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `create_datetime_utc` DATETIME NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(45) NOT NULL COMMENT 'file_type: xlsx, pdf or docx',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_reports_files_index_1` ON  `myems_reporting_db`.`tbl_reports_files`  (`file_name`);
  CREATE INDEX `tbl_reports_files_index_2` ON  `myems_reporting_db`.`tbl_reports_files`  (`create_datetime_utc`);

COMMIT;
