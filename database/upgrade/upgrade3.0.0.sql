
-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 2.11.0 TO 3.0.0RC
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`));

CREATE INDEX `tbl_working_calendars_index_1` ON  `myems_system_db`.`tbl_working_calendars`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_working_calendars_non_working_days`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_working_calendars_non_working_days` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_working_calendars_non_working_days` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `working_calendar_id` BIGINT NOT NULL,
  `date_local` DATE NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_working_calendars_non_working_days_index_1` ON  `myems_system_db`.`tbl_working_calendars_non_working_days`  (`working_calendar_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_working_calendars_index_1` ON  `myems_system_db`.`tbl_spaces_working_calendars`   (`space_id`);
