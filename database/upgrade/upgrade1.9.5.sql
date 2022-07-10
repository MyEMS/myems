-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.9.4 TO 1.9.5
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_reporting_db`.`tbl_template_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_reporting_db`.`tbl_template_files` ;

CREATE TABLE IF NOT EXISTS `myems_reporting_db`.`tbl_template_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `report_id` BIGINT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(45) NOT NULL COMMENT 'file_type: xlsx, pdf or docx',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_template_files_index_1` ON  `myems_reporting_db`.`tbl_template_files`  (`file_name`);
  CREATE INDEX `tbl_template_files_index_2` ON  `myems_reporting_db`.`tbl_template_files`  (`report_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.9.5', release_date='2022-07-10' WHERE id=1;

COMMIT;
