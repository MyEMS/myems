-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 2.11.0 TO 2.12.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_non_working_days`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_non_working_days` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_non_working_days` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `date_local` DATE NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_non_working_days_index_1` ON  `myems_system_db`.`tbl_spaces_non_working_days`  (`space_id`, `date_local`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='2.12.0', release_date='2022-01-16' WHERE id=1;

COMMIT;
