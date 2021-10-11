-- MyEMS Billing Baseline Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_billing_baseline_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_billing_baseline_db` ;
CREATE DATABASE IF NOT EXISTS `myems_billing_baseline_db` ;
USE `myems_billing_baseline_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_combined_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_combined_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_combined_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_combined_equipment_input_category_hourly`   (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_combined_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_combined_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_combined_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_combined_equipment_input_item_hourly`   (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_combined_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_combined_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_combined_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_combined_equipment_output_category_hourly`   (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_equipment_input_category_hourly`   (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_equipment_input_item_hourly`   (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_equipment_output_category_hourly`   (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_shopfloor_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_shopfloor_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_shopfloor_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_shopfloor_input_category_hourly`   (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_shopfloor_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_shopfloor_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_shopfloor_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_shopfloor_input_item_hourly`   (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_space_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_space_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_space_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_space_input_category_hourly`   (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_space_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_space_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_space_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_space_input_item_hourly`   (`space_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_space_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_space_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_space_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_space_output_category_hourly`   (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_store_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_store_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_store_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_store_input_category_hourly`   (`store_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_store_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_store_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_store_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_store_input_item_hourly`   (`store_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_tenant_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_tenant_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_tenant_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_tenant_input_category_hourly`   (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_tenant_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_tenant_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_tenant_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_hourly_index_1` ON  `myems_billing_baseline_db`.`tbl_tenant_input_item_hourly`   (`tenant_id`, `energy_item_id`, `start_datetime_utc`);
