
-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 2.11.0 TO 3.0.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(64),
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
  `description` VARCHAR(64),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_working_calendars_non_working_days_index_1` ON  `myems_system_db`.`tbl_working_calendars_non_working_days`  (`working_calendar_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_working_calendars_index_1` ON  `myems_system_db`.`tbl_shopfloors_working_calendars` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_working_calendars_index_1` ON  `myems_system_db`.`tbl_spaces_working_calendars` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_working_calendars_index_1` ON  `myems_system_db`.`tbl_stores_working_calendars` (`store_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_working_calendars_index_1` ON  `myems_system_db`.`tbl_tenants_working_calendars` (`tenant_id`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.0.0', release_date='2023-02-25' WHERE id=1;
