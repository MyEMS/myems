-- MyEMS Billing Baseline Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_billing_baseline_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_billing_baseline_db` ;
CREATE DATABASE IF NOT EXISTS `myems_billing_baseline_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
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
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_combined_equipment_input_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_combined_equipment_input_item_hourly`
 (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_combined_equipment_output_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_equipment_input_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_equipment_input_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_equipment_input_item_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_equipment_input_item_hourly`
 (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_equipment_output_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_equipment_output_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_meter_hourly` (`meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_offline_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_offline_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_offline_meter_hourly` (`offline_meter_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_shopfloor_input_category_hourly`
 (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_shopfloor_input_item_hourly`
 (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_space_input_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_space_input_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_space_input_item_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_space_input_item_hourly`
 (`space_id`, `energy_item_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_space_output_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_space_output_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_store_input_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_store_input_category_hourly`
 (`store_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_store_input_item_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_store_input_item_hourly`
 (`store_id`, `energy_item_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_tenant_input_category_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_tenant_input_category_hourly`
 (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

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
CREATE INDEX `tbl_tenant_input_item_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_tenant_input_item_hourly`
 (`tenant_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_baseline_db`.`tbl_virtual_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_baseline_db`.`tbl_virtual_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_baseline_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_billing_baseline_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

-- MyEMS Billing Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_billing_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_billing_db` ;
CREATE DATABASE IF NOT EXISTS `myems_billing_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_billing_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_combined_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_combined_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_combined_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_combined_equipment_input_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_combined_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_combined_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_combined_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1`
 ON `myems_billing_db`.`tbl_combined_equipment_input_item_hourly`
 (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_combined_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_combined_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_combined_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_combined_equipment_output_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_energy_storage_container_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_energy_storage_container_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_container_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_charge_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_container_charge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_energy_storage_container_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_energy_storage_container_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_container_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_discharge_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_container_discharge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_energy_storage_power_station_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_energy_storage_power_station_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_power_station_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_charge_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_power_station_charge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_energy_storage_power_station_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_energy_storage_power_station_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_energy_storage_power_station_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_discharge_hourly_index_1`
 ON `myems_billing_db`.`tbl_energy_storage_power_station_discharge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_equipment_input_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_hourly_index_1`
 ON `myems_billing_db`.`tbl_equipment_input_item_hourly`
 (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_equipment_output_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1` ON `myems_billing_db`.`tbl_meter_hourly` (`meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_microgrid_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_microgrid_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1` ON `myems_billing_db`.`tbl_microgrid_charge_hourly` (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_microgrid_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_microgrid_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1` ON `myems_billing_db`.`tbl_microgrid_discharge_hourly` (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_microgrid_evcharger_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_microgrid_evcharger_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_evcharger_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_evcharger_hourly_index_1`
 ON `myems_billing_db`.`tbl_microgrid_evcharger_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_microgrid_grid_buy_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_microgrid_grid_buy_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_buy_hourly_index_1`
 ON `myems_billing_db`.`tbl_microgrid_grid_buy_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_microgrid_grid_sell_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_microgrid_grid_sell_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_sell_hourly_index_1`
 ON `myems_billing_db`.`tbl_microgrid_grid_sell_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_microgrid_load_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_microgrid_load_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_load_hourly_index_1`
 ON `myems_billing_db`.`tbl_microgrid_load_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_microgrid_photovoltaic_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_microgrid_photovoltaic_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_photovoltaic_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_photovoltaic_hourly_index_1`
 ON `myems_billing_db`.`tbl_microgrid_photovoltaic_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_offline_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_offline_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_billing_db`.`tbl_offline_meter_hourly` (`offline_meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_shopfloor_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_shopfloor_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_shopfloor_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_shopfloor_input_category_hourly`
 (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_shopfloor_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_shopfloor_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_shopfloor_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1`
 ON `myems_billing_db`.`tbl_shopfloor_input_item_hourly`
 (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_space_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_space_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_space_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_space_input_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_space_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_space_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_space_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_hourly_index_1`
 ON `myems_billing_db`.`tbl_space_input_item_hourly`
 (`space_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_space_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_space_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_space_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_space_output_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_store_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_store_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_store_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_store_input_category_hourly`
 (`store_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_store_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_store_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_store_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_hourly_index_1`
 ON `myems_billing_db`.`tbl_store_input_item_hourly`
 (`store_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_tenant_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_tenant_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_tenant_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_hourly_index_1`
 ON `myems_billing_db`.`tbl_tenant_input_category_hourly`
 (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_tenant_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_tenant_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_tenant_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_hourly_index_1`
 ON `myems_billing_db`.`tbl_tenant_input_item_hourly`
 (`tenant_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_billing_db`.`tbl_virtual_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_virtual_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_billing_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

-- MyEMS Carbon Emission Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_carbon_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_carbon_db` ;
CREATE DATABASE IF NOT EXISTS `myems_carbon_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_carbon_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_combined_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_combined_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_combined_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_combined_equipment_input_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_combined_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_combined_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_combined_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1`
 ON `myems_carbon_db`.`tbl_combined_equipment_input_item_hourly`
 (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_combined_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_combined_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_combined_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_combined_equipment_output_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_energy_storage_container_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_energy_storage_container_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_container_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_charge_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_container_charge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_energy_storage_container_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_energy_storage_container_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_container_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_discharge_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_container_discharge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_energy_storage_power_station_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_energy_storage_power_station_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_power_station_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_charge_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_power_station_charge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_energy_storage_power_station_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_energy_storage_power_station_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_energy_storage_power_station_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_discharge_hourly_index_1`
 ON `myems_carbon_db`.`tbl_energy_storage_power_station_discharge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_equipment_input_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_hourly_index_1`
 ON `myems_carbon_db`.`tbl_equipment_input_item_hourly`
 (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_equipment_output_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1`
 ON `myems_carbon_db`.`tbl_meter_hourly`
 (`meter_id`, `start_datetime_utc`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_microgrid_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_microgrid_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1`
 ON `myems_carbon_db`.`tbl_microgrid_charge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_microgrid_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_microgrid_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1`
 ON `myems_carbon_db`.`tbl_microgrid_discharge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_microgrid_evcharger_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_microgrid_evcharger_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_microgrid_evcharger_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_evcharger_hourly_index_1`
 ON `myems_carbon_db`.`tbl_microgrid_evcharger_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_microgrid_grid_buy_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_microgrid_grid_buy_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_microgrid_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_buy_hourly_index_1`
 ON `myems_carbon_db`.`tbl_microgrid_grid_buy_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_microgrid_grid_sell_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_microgrid_grid_sell_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_microgrid_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_sell_hourly_index_1`
 ON `myems_carbon_db`.`tbl_microgrid_grid_sell_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_microgrid_load_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_microgrid_load_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_microgrid_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_load_hourly_index_1`
 ON `myems_carbon_db`.`tbl_microgrid_load_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_microgrid_photovoltaic_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_microgrid_photovoltaic_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_microgrid_photovoltaic_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_photovoltaic_hourly_index_1`
 ON `myems_carbon_db`.`tbl_microgrid_photovoltaic_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_offline_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_offline_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_carbon_db`.`tbl_offline_meter_hourly`
 (`offline_meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_shopfloor_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_shopfloor_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_shopfloor_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_shopfloor_input_category_hourly`
 (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_shopfloor_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_shopfloor_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_shopfloor_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1`
 ON `myems_carbon_db`.`tbl_shopfloor_input_item_hourly`
 (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_space_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_space_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_space_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_space_input_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_space_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_space_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_space_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_hourly_index_1`
 ON `myems_carbon_db`.`tbl_space_input_item_hourly`
 (`space_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_space_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_space_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_space_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_space_output_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_store_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_store_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_store_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_store_input_category_hourly`
 (`store_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_store_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_store_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_store_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_hourly_index_1`
 ON `myems_carbon_db`.`tbl_store_input_item_hourly`
 (`store_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_tenant_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_tenant_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_tenant_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_hourly_index_1`
 ON `myems_carbon_db`.`tbl_tenant_input_category_hourly`
 (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_tenant_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_tenant_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_tenant_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_hourly_index_1`
 ON `myems_carbon_db`.`tbl_tenant_input_item_hourly`
 (`tenant_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_carbon_db`.`tbl_virtual_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_virtual_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_carbon_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_carbon_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

-- MyEMS Energy Baseline Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_energy_baseline_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_energy_baseline_db` ;
CREATE DATABASE IF NOT EXISTS `myems_energy_baseline_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_energy_baseline_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_combined_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_combined_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_combined_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_combined_equipment_input_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_combined_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_combined_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_combined_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_combined_equipment_input_item_hourly`
 (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_combined_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_combined_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_combined_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_combined_equipment_output_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_equipment_input_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_equipment_input_item_hourly`
 (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_equipment_output_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_meter_hourly`
 (`meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_offline_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_offline_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_offline_meter_hourly` (`offline_meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_shopfloor_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_shopfloor_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_shopfloor_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_shopfloor_input_category_hourly`
 (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_shopfloor_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_shopfloor_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_shopfloor_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_shopfloor_input_item_hourly`
 (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_space_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_space_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_space_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_space_input_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_space_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_space_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_space_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_space_input_item_hourly`
 (`space_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_space_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_space_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_space_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_space_output_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_store_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_store_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_store_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_store_input_category_hourly`
 (`store_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_store_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_store_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_store_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_store_input_item_hourly`
 (`store_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_tenant_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_tenant_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_tenant_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_tenant_input_category_hourly`
 (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_tenant_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_tenant_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_tenant_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_tenant_input_item_hourly`
 (`tenant_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_baseline_db`.`tbl_virtual_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_baseline_db`.`tbl_virtual_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_baseline_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_energy_baseline_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

-- MyEMS Energy Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_energy_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_energy_db` ;
CREATE DATABASE IF NOT EXISTS `myems_energy_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_energy_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_combined_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_combined_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_combined_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_combined_equipment_input_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_combined_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_combined_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_combined_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1`
 ON `myems_energy_db`.`tbl_combined_equipment_input_item_hourly`
 (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_combined_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_combined_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_combined_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_combined_equipment_output_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_energy_storage_container_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_energy_storage_container_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_container_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_charge_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_container_charge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_energy_storage_container_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_energy_storage_container_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_container_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_container_discharge_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_container_discharge_hourly`
 (`energy_storage_container_id`, `start_datetime_utc`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_energy_storage_power_station_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_energy_storage_power_station_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_power_station_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_charge_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_power_station_charge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_energy_storage_power_station_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_energy_storage_power_station_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_energy_storage_power_station_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_station_discharge_hourly_index_1`
 ON `myems_energy_db`.`tbl_energy_storage_power_station_discharge_hourly`
 (`energy_storage_power_station_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_equipment_input_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_hourly_index_1`
 ON `myems_energy_db`.`tbl_equipment_input_item_hourly` (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_equipment_output_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1` ON `myems_energy_db`.`tbl_meter_hourly` (`meter_id`, `start_datetime_utc`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_microgrid_charge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_microgrid_charge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1`
 ON `myems_energy_db`.`tbl_microgrid_charge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_microgrid_discharge_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_microgrid_discharge_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1`
 ON `myems_energy_db`.`tbl_microgrid_discharge_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_microgrid_evcharger_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_microgrid_evcharger_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_evcharger_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_evcharger_hourly_index_1`
 ON `myems_energy_db`.`tbl_microgrid_evcharger_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_microgrid_grid_buy_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_microgrid_grid_buy_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_grid_buy_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_buy_hourly_index_1`
 ON `myems_energy_db`.`tbl_microgrid_grid_buy_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_microgrid_grid_sell_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_microgrid_grid_sell_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_grid_sell_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_grid_sell_hourly_index_1`
 ON `myems_energy_db`.`tbl_microgrid_grid_sell_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_microgrid_load_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_microgrid_load_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_load_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_load_hourly_index_1`
 ON `myems_energy_db`.`tbl_microgrid_load_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_microgrid_photovoltaic_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_microgrid_photovoltaic_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_photovoltaic_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_photovoltaic_hourly_index_1`
 ON `myems_energy_db`.`tbl_microgrid_photovoltaic_hourly`
 (`microgrid_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1` ON `myems_energy_db`.`tbl_meter_hourly`   (`meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_offline_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_offline_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_energy_db`.`tbl_offline_meter_hourly` (`offline_meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_shopfloor_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_shopfloor_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_shopfloor_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1`
 ON  `myems_energy_db`.`tbl_shopfloor_input_category_hourly`
 (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_shopfloor_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_shopfloor_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_shopfloor_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1`
  ON `myems_energy_db`.`tbl_shopfloor_input_item_hourly`
  (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_space_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_space_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_space_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_space_input_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_space_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_space_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_space_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_hourly_index_1`
 ON `myems_energy_db`.`tbl_space_input_item_hourly` (`space_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_space_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_space_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_space_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_space_output_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_store_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_store_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_store_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_store_input_category_hourly`
 (`store_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_store_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_store_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_store_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_hourly_index_1`
 ON `myems_energy_db`.`tbl_store_input_item_hourly` (`store_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_tenant_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_tenant_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_tenant_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_hourly_index_1`
 ON `myems_energy_db`.`tbl_tenant_input_category_hourly`
 (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_tenant_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_tenant_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_tenant_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_hourly_index_1`
 ON `myems_energy_db`.`tbl_tenant_input_item_hourly` (`tenant_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_db`.`tbl_virtual_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_virtual_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_energy_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

-- MyEMS Energy Model Database
-- store energy consumption models in 8760 hours of year, hour by hour
-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_energy_model_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_energy_model_db` ;
CREATE DATABASE IF NOT EXISTS `myems_energy_model_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_energy_model_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_combined_equipment_input_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_combined_equipment_input_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_combined_equipment_input_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_8760_index_1`
ON `myems_energy_model_db`.`tbl_combined_equipment_input_category_8760`
(`combined_equipment_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_combined_equipment_input_item_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_combined_equipment_input_item_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_combined_equipment_input_item_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_8760_index_1`
 ON `myems_energy_model_db`.`tbl_combined_equipment_input_item_8760`
 (`combined_equipment_id`, `energy_item_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_combined_equipment_output_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_combined_equipment_output_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_combined_equipment_output_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_8760_index_1`
 ON `myems_energy_model_db`.`tbl_combined_equipment_output_category_8760`
 (`combined_equipment_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_equipment_input_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_equipment_input_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_equipment_input_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_8760_index_1`
 ON`myems_energy_model_db`.`tbl_equipment_input_category_8760`
 (`equipment_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_equipment_input_item_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_equipment_input_item_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_equipment_input_item_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_8760_index_1`
 ON `myems_energy_model_db`.`tbl_equipment_input_item_8760`
 (`equipment_id`, `energy_item_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_equipment_output_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_equipment_output_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_equipment_output_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_8760_index_1`
 ON `myems_energy_model_db`.`tbl_equipment_output_category_8760`
 (`equipment_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_meter_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_meter_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_meter_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_8760_index_1` ON `myems_energy_model_db`.`tbl_meter_8760` (`meter_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_offline_meter_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_offline_meter_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_offline_meter_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_8760_index_1`
 ON `myems_energy_model_db`.`tbl_offline_meter_8760` (`offline_meter_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_shopfloor_input_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_shopfloor_input_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_shopfloor_input_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_8760_index_1`
 ON `myems_energy_model_db`.`tbl_shopfloor_input_category_8760`
 (`shopfloor_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_shopfloor_input_item_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_shopfloor_input_item_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_shopfloor_input_item_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_8760_index_1`
 ON `myems_energy_model_db`.`tbl_shopfloor_input_item_8760`
 (`shopfloor_id`, `energy_item_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_space_input_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_space_input_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_space_input_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_8760_index_1`
 ON `myems_energy_model_db`.`tbl_space_input_category_8760`
 (`space_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_space_input_item_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_space_input_item_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_space_input_item_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_8760_index_1`
 ON `myems_energy_model_db`.`tbl_space_input_item_8760`
 (`space_id`, `energy_item_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_space_output_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_space_output_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_space_output_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_8760_index_1`
 ON `myems_energy_model_db`.`tbl_space_output_category_8760` (`space_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_store_input_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_store_input_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_store_input_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_8760_index_1`
 ON `myems_energy_model_db`.`tbl_store_input_category_8760` (`store_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_store_input_item_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_store_input_item_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_store_input_item_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_8760_index_1`
 ON `myems_energy_model_db`.`tbl_store_input_item_8760` (`store_id`, `energy_item_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_tenant_input_category_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_tenant_input_category_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_tenant_input_category_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_8760_index_1`
 ON `myems_energy_model_db`.`tbl_tenant_input_category_8760` (`tenant_id`, `energy_category_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_tenant_input_item_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_tenant_input_item_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_tenant_input_item_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_8760_index_1`
ON `myems_energy_model_db`.`tbl_tenant_input_item_8760` (`tenant_id`, `energy_item_id`, `hour_of_year`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_model_db`.`tbl_virtual_meter_8760`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_model_db`.`tbl_virtual_meter_8760` ;

CREATE TABLE IF NOT EXISTS `myems_energy_model_db`.`tbl_virtual_meter_8760` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `hour_of_year` INT NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_8760_index_1`
 ON `myems_energy_model_db`.`tbl_virtual_meter_8760` (`virtual_meter_id`, `hour_of_year`);

-- MyEMS Energy Plan Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_energy_plan_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_energy_plan_db` ;
CREATE DATABASE IF NOT EXISTS `myems_energy_plan_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_energy_plan_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_combined_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_combined_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_combined_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_combined_equipment_input_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_combined_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_combined_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_combined_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_input_item_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_combined_equipment_input_item_hourly`
 (`combined_equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_combined_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_combined_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_combined_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_output_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_combined_equipment_output_category_hourly`
 (`combined_equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_equipment_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_equipment_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_equipment_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_equipment_input_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_equipment_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_equipment_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_equipment_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_input_item_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_equipment_input_item_hourly`
 (`equipment_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_equipment_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_equipment_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_equipment_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_output_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_equipment_output_category_hourly`
 (`equipment_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_meter_hourly`
 (`meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_offline_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_offline_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_offline_meter_hourly` (`offline_meter_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_shopfloor_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_shopfloor_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_shopfloor_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_shopfloor_input_category_hourly`
 (`shopfloor_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_shopfloor_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_shopfloor_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_shopfloor_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_input_item_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_shopfloor_input_item_hourly`
 (`shopfloor_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_space_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_space_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_space_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_space_input_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_space_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_space_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_space_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_input_item_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_space_input_item_hourly`
 (`space_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_space_output_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_space_output_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_space_output_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_output_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_space_output_category_hourly`
 (`space_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_store_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_store_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_store_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_store_input_category_hourly`
 (`store_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_store_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_store_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_store_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_input_item_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_store_input_item_hourly`
 (`store_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_tenant_input_category_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_tenant_input_category_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_tenant_input_category_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_category_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_tenant_input_category_hourly`
 (`tenant_id`, `energy_category_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_tenant_input_item_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_tenant_input_item_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_tenant_input_item_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_input_item_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_tenant_input_item_hourly`
 (`tenant_id`, `energy_item_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_energy_plan_db`.`tbl_virtual_meter_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_energy_plan_db`.`tbl_virtual_meter_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

-- MyEMS Fault Detection and Diagnostics Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_fdd_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_fdd_db`;
CREATE DATABASE IF NOT EXISTS `myems_fdd_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_fdd_db`;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_email_messages`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_email_messages`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_email_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `rule_id` BIGINT NOT NULL,
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
CREATE INDEX `tbl_email_messages_index_1` ON `myems_fdd_db`.`tbl_email_messages` (`status`, `scheduled_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_rules`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_rules`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_rules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `category` VARCHAR(128) NOT NULL
  COMMENT 'REALTIME, SYSTEM, SPACE, METER, TENANT, STORE, SHOPFLOOR, EQUIPMENT, COMBINEDEQUIPMENT',
  `fdd_code` VARCHAR(128) NOT NULL
  COMMENT 'REALTIME01, REALTIME01... SYSTEM01, SYSTEM02, ... SPACE01, SPACE02, ... METER01, METER02, ...',
  `priority` VARCHAR(128) NOT NULL COMMENT 'CRITICAL, HIGH, MEDIUM, LOW',
  `channel` VARCHAR(128) NOT NULL COMMENT 'WEB, EMAIL, SMS, WECHAT, CALL',
  `expression` LONGTEXT NULL COMMENT 'MUST be in JSON format',
  `message_template` TEXT NOT NULL COMMENT 'Plain text template that supports $-substitutions',
  `is_enabled` BOOL NOT NULL,
  `last_run_datetime_utc` DATETIME,
  `next_run_datetime_utc` DATETIME,
  `is_run_immediately` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_rules_index_1` ON `myems_fdd_db`.`tbl_rules` (`name`);

-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_email_servers`
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_email_servers`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_email_servers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `host` VARCHAR(255) NOT NULL,
  `port` INT NOT NULL,
  `requires_authentication` BOOL NOT NULL,
  `user_name` VARCHAR(255),
  `password` VARCHAR(255),
  `from_addr` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));

-- ----------------------------------------------------------------------------------
-- Data for table `myems_fdd_db`.`tbl_email_servers`
-- ----------------------------------------------------------------------------------
INSERT INTO `myems_fdd_db`.`tbl_email_servers`
(`id`, `host`, `port`, `requires_authentication`, `user_name`, `password`, `from_addr`)
VALUES
(1, 'smtp.163.com', 25, true, 'myems', 'bXllbXM=', 'myems@163.com');

-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_text_messages_outbox`
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_text_messages_outbox`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_text_messages_outbox` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `rule_id` BIGINT NOT NULL,
  `recipient_name` VARCHAR(32) NOT NULL,
  `recipient_mobile` VARCHAR(32) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `scheduled_datetime_utc` DATETIME NOT NULL,
  `acknowledge_code` VARCHAR(32) NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, sent, acknowledged, timeout',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_text_messages_outbox_index_1`
ON `myems_fdd_db`.`tbl_text_messages_outbox` (`status`, `scheduled_datetime_utc`);

-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_text_messages_inbox`
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_text_messages_inbox`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_text_messages_inbox` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sender_mobile` VARCHAR(32) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `received_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, done',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_text_messages_inbox_index_1` ON `myems_fdd_db`.`tbl_text_messages_inbox` (`status`);


-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_web_messages`
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_web_messages`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_web_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `rule_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `subject` VARCHAR(128) NOT NULL,
  `category` VARCHAR(128) NOT NULL
  COMMENT 'SYSTEM, SPACE, METER, TENANT, STORE, SHOPFLOOR, EQUIPMENT, COMBINEDEQUIPMENT',
  `priority` VARCHAR(128) NOT NULL COMMENT 'CRITICAL, HIGH, MEDIUM, LOW',
  `message` LONGTEXT NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `start_datetime_utc` DATETIME NULL,
  `end_datetime_utc` DATETIME NULL,
  `update_datetime_utc` DATETIME NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, acknowledged, read',
  `reply` LONGTEXT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_web_messages_index_1`
ON `myems_fdd_db`.`tbl_web_messages` (`user_id`, `status`, `created_datetime_utc`);

-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_wechat_configs`
-- refer to https://mp.weixin.qq.com/
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_wechat_configs`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_wechat_configs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `api_server` VARCHAR(255) NOT NULL, -- WeChat Official Account Platform's API Server
  `app_id` VARCHAR(255) NOT NULL, -- Encoded APPID
  `app_secret` VARCHAR(255), -- Encoded APPSECRET
  `access_token` VARCHAR(512), -- Encoded ACCESS_TOKEN
  `expires_datetime_utc` DATETIME NOT NULL, -- ACCESS_TOKEN will expire at this datetime in UTC
  PRIMARY KEY (`id`));

-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_wechat_messages_outbox`
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_wechat_messages_outbox`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_wechat_messages_outbox` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `rule_id` BIGINT NOT NULL,
  `recipient_name` VARCHAR(32) NOT NULL,
  `recipient_openid` VARCHAR(32) NOT NULL,
  `message_template_id` VARCHAR(64) NOT NULL,
  `message_data` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `created_datetime_utc` DATETIME NOT NULL,
  `scheduled_datetime_utc` DATETIME NOT NULL,
  `acknowledge_code` VARCHAR(32) NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, sent, acknowledged, timeout',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_wechat_messages_outbox_index_1`
ON `myems_fdd_db`.`tbl_wechat_messages_outbox` (`status`, `scheduled_datetime_utc`);

-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_wechat_messages_inbox`
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_wechat_messages_inbox`;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_wechat_messages_inbox` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sender_openid` VARCHAR(32) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `received_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, done',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_wechat_messages_inbox_index_1` ON `myems_fdd_db`.`tbl_wechat_messages_inbox` (`status`);

COMMIT;

-- MyEMS Historical Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_historical_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_historical_db` ;
CREATE DATABASE IF NOT EXISTS `myems_historical_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_historical_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_analog_value`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_analog_value` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_analog_value` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  `is_bad` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_analog_value_index_1` ON `myems_historical_db`.`tbl_analog_value` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_analog_value_index_2` ON `myems_historical_db`.`tbl_analog_value` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_analog_value_latest`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_analog_value_latest` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_analog_value_latest` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_analog_value_latest_index_1`
ON `myems_historical_db`.`tbl_analog_value_latest` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_analog_value_latest_index_2` ON `myems_historical_db`.`tbl_analog_value_latest` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_cost_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_cost_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_cost_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_digital_value`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_digital_value` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_digital_value` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` INT NOT NULL,
  `is_bad` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_digital_value_index_1` ON `myems_historical_db`.`tbl_digital_value` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_digital_value_index_2` ON `myems_historical_db`.`tbl_digital_value` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_digital_value_latest`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_digital_value_latest` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_digital_value_latest` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` INT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_digital_value_latest_index_1`
ON `myems_historical_db`.`tbl_digital_value_latest` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_digital_value_latest_index_2` ON `myems_historical_db`.`tbl_digital_value_latest` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_energy_value`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_energy_value` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_energy_value` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  `is_bad` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_value_index_1` ON `myems_historical_db`.`tbl_energy_value` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_energy_value_index_2` ON `myems_historical_db`.`tbl_energy_value` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_energy_value_latest`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_energy_value_latest` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_energy_value_latest` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_value_latest_index_1`
ON `myems_historical_db`.`tbl_energy_value_latest` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_energy_value_latest_index_2` ON `myems_historical_db`.`tbl_energy_value_latest` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_offline_meter_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_offline_meter_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_offline_meter_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_data_repair_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_data_repair_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_data_repair_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_historical_db`.`tbl_energy_plan_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_historical_db`.`tbl_energy_plan_files` ;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_energy_plan_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));

COMMIT;

-- MyEMS Production Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_production_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_production_db` ;
CREATE DATABASE IF NOT EXISTS `myems_production_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_production_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_products`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_products` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `unit_of_measure` VARCHAR(32) NOT NULL,
  `tag` VARCHAR(128) NOT NULL,
  `standard_product_coefficient` DECIMAL(18, 3) NOT NULL DEFAULT 1.0,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_products_index_1` ON `myems_production_db`.`tbl_products` (`name`);

-- --------------------------------------------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shifts`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shifts` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shifts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `team_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_count` INT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `end_datetime_utc` DATETIME NOT NULL,
  `reference_timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shifts_index_1`
ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `product_id`, `end_datetime_utc`);
CREATE INDEX `tbl_shifts_index_2`
ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `product_id`, `start_datetime_utc`, `end_datetime_utc` );
CREATE INDEX `tbl_shifts_index_3` ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `reference_timestamp`);
CREATE INDEX `tbl_shifts_index_4` ON `myems_production_db`.`tbl_shifts` (`shopfloor_id`, `team_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shopfloor_hourly`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shopfloor_hourly` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shopfloor_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_count` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloor_hourly_index_1`
ON `myems_production_db`.`tbl_shopfloor_hourly` (`shopfloor_id`, `product_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shopfloors_products`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shopfloors_products` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shopfloors_products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_shopfloors_teams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_shopfloors_teams` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_shopfloors_teams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `team_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_production_db`.`tbl_teams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_production_db`.`tbl_teams` ;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_teams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_teams_index_1` ON `myems_production_db`.`tbl_teams`   (`name`);

-- MyEMS Reporting Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_reporting_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_reporting_db` ;
CREATE DATABASE IF NOT EXISTS `myems_reporting_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_reporting_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_reporting_db`.`tbl_email_messages`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_reporting_db`.`tbl_email_messages` ;

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
CREATE INDEX `tbl_email_messages_index_1`
ON `myems_reporting_db`.`tbl_email_messages` (`status`, `scheduled_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_reporting_db`.`tbl_reports`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_reporting_db`.`tbl_reports` ;

CREATE TABLE IF NOT EXISTS `myems_reporting_db`.`tbl_reports` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `expression` LONGTEXT NULL COMMENT 'MUST be in JSON format',
  `is_enabled` BOOL NOT NULL,
  `last_run_datetime_utc` DATETIME,
  `next_run_datetime_utc` DATETIME,
  `is_run_immediately` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_reports_index_1` ON `myems_reporting_db`.`tbl_reports` (`name`);


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
CREATE INDEX `tbl_reports_files_index_1` ON `myems_reporting_db`.`tbl_reports_files` (`file_name`);
CREATE INDEX `tbl_reports_files_index_2` ON `myems_reporting_db`.`tbl_reports_files` (`create_datetime_utc`);

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
CREATE INDEX `tbl_template_files_index_1` ON `myems_reporting_db`.`tbl_template_files` (`file_name`);
CREATE INDEX `tbl_template_files_index_2` ON `myems_reporting_db`.`tbl_template_files` (`report_id`);

COMMIT;

-- MyEMS System Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_system_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_system_db` ;
CREATE DATABASE IF NOT EXISTS `myems_system_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT,
  `camera_url` VARCHAR(1000),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_index_1` ON `myems_system_db`.`tbl_combined_equipments` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_comands_index_1` ON `myems_system_db`.`tbl_combined_equipments_commands` (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_equipments_index_1` ON `myems_system_db`.`tbl_combined_equipments_equipments` (`combined_equipment_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_meters_index_1` ON `myems_system_db`.`tbl_combined_equipments_meters` (`combined_equipment_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_offline_meters_index_1` ON `myems_system_db`.`tbl_combined_equipments_offline_meters` (`combined_equipment_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_parameters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_parameters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `parameter_type` VARCHAR(255)  COMMENT 'constant, point, fraction',
  `constant` VARCHAR(255) COMMENT 'NULL if type is not constant else string ',
  `point_id` BIGINT COMMENT 'NULL if type is not point else point ID ',
  `numerator_meter_uuid` CHAR(36) COMMENT 'the number above the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  `denominator_meter_uuid` CHAR(36) COMMENT 'the number below the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_parameters_index_1` ON `myems_system_db`.`tbl_combined_equipments_parameters` (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_virtual_meters_index_1` ON `myems_system_db`.`tbl_combined_equipments_virtual_meters` (`combined_equipment_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `set_value` DECIMAL(18, 3) NULL COMMENT 'If not null, the $s1 in payload will be replaced with this value',
  `description` VARCHAR(255) ,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_commands_index_1` ON `myems_system_db`.`tbl_commands` (`name`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_contacts`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_contacts` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_contacts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) ,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_cost_centers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_cost_centers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_cost_centers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `external_id` VARCHAR(36) COMMENT 'ID in external syste, such as SAP, ERP',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_cost_centers_index_1` ON `myems_system_db`.`tbl_cost_centers` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_cost_centers_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_cost_centers_tariffs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_cost_centers_tariffs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cost_center_id` BIGINT NOT NULL,
  `tariff_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_cost_centers_tariffs_index_1` ON `myems_system_db`.`tbl_cost_centers_tariffs` (`cost_center_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_data_sources` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `gateway_id` BIGINT NOT NULL,
  `protocol` VARCHAR(16) NOT NULL,
  `connection` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `last_seen_datetime_utc` DATETIME NULL  COMMENT 'The last seen date time in UTC via PING or TELNET',
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_data_sources_index_1` ON `myems_system_db`.`tbl_data_sources` (`name`);
CREATE INDEX `tbl_data_sources_index_2` ON `myems_system_db`.`tbl_data_sources` (`gateway_id`);
CREATE INDEX `tbl_data_sources_index_3` ON `myems_system_db`.`tbl_data_sources` (`protocol`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_circuits`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_circuits` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_circuits` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `distribution_system_id` BIGINT NOT NULL,
  `distribution_room` VARCHAR(255) NOT NULL COMMENT '配电房, 配电间',
  `switchgear` VARCHAR(255) NOT NULL COMMENT '高/低压配电柜',
  `peak_load` DECIMAL(18, 3)  COMMENT '最大容量, 设备容量(KW)',
  `peak_current` DECIMAL(18, 3) COMMENT '最大电流, 计算电流(A)',
  `customers` VARCHAR(255) COMMENT '用电设备, 用户',
  `meters` VARCHAR(255) COMMENT '出线电表, 下级电表',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_circuits_index_1`
ON `myems_system_db`.`tbl_distribution_circuits` (`distribution_system_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_circuits_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_circuits_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_circuits_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `distribution_circuit_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_circuits_points_index_1`
ON `myems_system_db`.`tbl_distribution_circuits_points` (`distribution_circuit_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `svg_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_systems_index_1` ON `myems_system_db`.`tbl_distribution_systems` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_categories`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_categories` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `unit_of_measure` VARCHAR(32) NOT NULL,
  `kgce` DECIMAL(18, 3) NOT NULL COMMENT 'Kilogram of Coal Equivalent',
  `kgco2e` DECIMAL(18, 3) NOT NULL COMMENT 'Carbon Dioxide Emissions Factor',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_categories_index_1` ON `myems_system_db`.`tbl_energy_categories` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_items`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_items` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_items_index_1` ON `myems_system_db`.`tbl_energy_items` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_index_1` ON `myems_system_db`.`tbl_energy_flow_diagrams` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams_links`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_links` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_links` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_flow_diagram_id` BIGINT NOT NULL,
  `source_node_id` BIGINT NOT NULL,
  `target_node_id` BIGINT NOT NULL,
  `meter_uuid` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_links_index_1`
ON `myems_system_db`.`tbl_energy_flow_diagrams_links` (`energy_flow_diagram_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_nodes` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_nodes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_flow_diagram_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_nodes_index_1`
ON `myems_system_db`.`tbl_energy_flow_diagrams_nodes` (`energy_flow_diagram_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `rated_capacity` DECIMAL(18, 3) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_index_1` ON `myems_system_db`.`tbl_energy_storage_containers` (`name`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_batteries`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_batteries` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_batteries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `battery_state_point_id` BIGINT NOT NULL,
  `soc_point_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `charge_meter_id` BIGINT NOT NULL,
  `discharge_meter_id` BIGINT NOT NULL,
  `rated_capacity` DECIMAL(18, 3) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `nominal_voltage` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_batteries_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_batteries` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_commands_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_commands` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `run_state_point_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(18, 3) NOT NULL,
  `today_charge_energy_point_id` BIGINT NOT NULL,
  `today_discharge_energy_point_id` BIGINT NOT NULL,
  `total_charge_energy_point_id` BIGINT NOT NULL,
  `total_discharge_energy_point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_pcs_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_grids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_grids_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_grids` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_loads`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_grids_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_loads` (`energy_storage_container_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_schedules`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_schedules` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_schedules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `peak_type` VARCHAR(8) NOT NULL
  COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷',
  `power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_schedules_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_schedules` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_sensors_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_sensors` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `rated_capacity` DECIMAL(18, 3) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_index_1`
ON `myems_system_db`.`tbl_energy_storage_power_stations` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations_containers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_containers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_containers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_containers_index_1`
ON `myems_system_db`.`tbl_energy_storage_power_stations_containers` (`energy_storage_power_station_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_users` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_users_index_1`
ON `myems_system_db`.`tbl_energy_storage_power_stations_users` (`energy_storage_power_station_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT,
  `camera_url` VARCHAR(1000),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_index_1` ON `myems_system_db`.`tbl_equipments` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_comands_index_1` ON `myems_system_db`.`tbl_equipments_commands` (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_meters_index_1` ON `myems_system_db`.`tbl_equipments_meters` (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_offline_meters_index_1`
ON `myems_system_db`.`tbl_equipments_offline_meters` (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_parameters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_parameters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `parameter_type` VARCHAR(255)  COMMENT 'constant, point, fraction',
  `constant` VARCHAR(255) COMMENT 'NULL if type is not constant else string ',
  `point_id` BIGINT COMMENT 'NULL if type is not point else point ID ',
  `numerator_meter_uuid` CHAR(36) COMMENT 'the number above the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  `denominator_meter_uuid` CHAR(36) COMMENT 'the number below the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_parameters_index_1` ON `myems_system_db`.`tbl_equipments_parameters` (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_virtual_meters_index_1`
ON `myems_system_db`.`tbl_equipments_virtual_meters` (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_gateways`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_gateways` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_gateways` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `token` CHAR(36) NOT NULL,
  `last_seen_datetime_utc` DATETIME NULL  COMMENT 'The last seen date time in UTC via PING, TELNET or Heartbeat',
  `description` VARCHAR(255) ,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_gateways_index_1` ON `myems_system_db`.`tbl_gateways` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Default Data for table `myems_system_db`.`tbl_gateways`
-- This gateway's token is used by myems-modbus-tcp service
-- ---------------------------------------------------------------------------------------------------------------------
INSERT INTO `myems_system_db`.`tbl_gateways`
(`id`, `name`, `uuid`, `token`,  `last_seen_datetime_utc`, `description`)
VALUES
(1, 'Gateway1', 'dc681938-5053-8660-98ed-266c58227231', '983427af-1c35-42ba-8b4d-288675550225', null, null);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_integrators`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_integrators` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_integrators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `high_temperature_point_id` BIGINT NOT NULL,
  `low_temperature_point_id` BIGINT NOT NULL,
  `flow_point_id` BIGINT NOT NULL,
  `heat_capacity` DECIMAL(18, 3) NOT NULL,
  `liquid_density` DECIMAL(18, 3) NOT NULL,
  `coefficient` DECIMAL(18, 3) NOT NULL,
  `result_point_id` BIGINT NOT NULL,
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_integrators_index_1` ON `myems_system_db`.`tbl_integrators` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_knowledge_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_knowledge_files` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_knowledge_files` (
`id` BIGINT NOT NULL AUTO_INCREMENT,
`file_name` VARCHAR(255) NOT NULL,
`uuid` CHAR(36) NOT NULL,
`upload_datetime_utc` DATETIME NOT NULL,
`upload_user_uuid` CHAR(36) NOT NULL,
`file_object` LONGBLOB NOT NULL,
PRIMARY KEY (`id`));
CREATE INDEX `tbl_knowledge_files_index_1` ON `myems_system_db`.`tbl_knowledge_files` (`file_name`);
CREATE INDEX `tbl_knowledge_files_index_2` ON `myems_system_db`.`tbl_knowledge_files` (`upload_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_menus`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_menus` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_menus` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `route` VARCHAR(256) NOT NULL,
  `parent_menu_id` BIGINT,
  `is_hidden` BOOL NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(100,'Space Data','/space',NULL,0),
(101,'Energy Category Data','/space/energycategory',100,0),
(102,'Energy Item Data','/space/energyitem',100,0),
(103,'Cost','/space/cost',100,0),
(104,'Output','/space/output',100,0),
(105,'Income','/space/income',100,0),
(106,'Efficiency','/space/efficiency',100,0),
(107,'Load','/space/load',100,0),
(108,'Statistics','/space/statistics',100,0),
(109,'Saving','/space/saving',100,1),
(110,'Carbon','/space/carbon',100,0),
(111,'Environment Monitor','/space/environmentmonitor',100,0),
(112,'Plan','/space/plan',100,1),
(200,'Equipment Data','/equipment',NULL,0),
(201,'Energy Category Data','/equipment/energycategory',200,0),
(202,'Energy Item Data','/equipment/energyitem',200,0),
(203,'Cost','/equipment/cost',200,0),
(204,'Output','/equipment/output',200,0),
(205,'Income','/equipment/income',200,0),
(206,'Efficiency','/equipment/efficiency',200,0),
(207,'Load','/equipment/load',200,0),
(208,'Statistics','/equipment/statistics',200,0),
(209,'Saving','/equipment/saving',200,1),
(210,'Batch Analysis','/equipment/batch',200,0),
(211,'Equipment Tracking','/equipment/tracking',200,0),
(212,'Carbon','/equipment/carbon',200,0),
(213,'Plan','/equipment/plan',200,1),
(300,'Meter Data','/meter',NULL,0),
(301,'Meter Energy','/meter/meterenergy',300,0),
(302,'Meter Cost','/meter/metercost',300,0),
(303,'Meter Trend','/meter/metertrend',300,0),
(304,'Meter Realtime','/meter/meterrealtime',300,0),
(305,'Master Meter Submeters Balance','/meter/metersubmetersbalance',300,0),
(306,'Virtual Meter Energy','/meter/virtualmeterenergy',300,0),
(307,'Virtual Meter Cost','/meter/virtualmetercost',300,0),
(308,'Offline Meter Energy','/meter/offlinemeterenergy',300,0),
(309,'Offline Meter Cost','/meter/offlinemetercost',300,0),
(310,'Meter Batch Analysis','/meter/meterbatch',300,0),
(311,'Meter Tracking','/meter/metertracking',300,0),
(312,'Meter Carbon','/meter/metercarbon',300,0),
(313,'Virtual Meter Carbon','/meter/virtualmetercarbon',300,0),
(314,'Virtual Meter Batch Analysis','/meter/virtualmeterbatch',300,0),
(315,'Offline Meter Batch Analysis','/meter/offlinemeterbatch',300,0),
(316,'Offline Meter Carbon','/meter/offlinemetercarbon',300,0),
(317,'Meter Saving','/meter/metersaving',300,1),
(318,'Offline Meter Saving','/meter/offlinemetersaving',300,1),
(319,'Virtual Meter Saving','/meter/virtualmetersaving',300,1),
(320,'Meter Comparison','/meter/metercomparison',300,0),
(321,'Offline Meter Input','/meter/offlinemeterinput',300,0),
(322,'Meter Plan','/meter/meterplan',300,1),
(323,'Offline Meter Plan','/meter/offlinemeterplan',300,1),
(324,'Virtual Meter Plan','/meter/virtualmeterplan',300,1),
(400,'Tenant Data','/tenant',NULL,0),
(401,'Energy Category Data','/tenant/energycategory',400,0),
(402,'Energy Item Data','/tenant/energyitem',400,0),
(403,'Cost','/tenant/cost',400,0),
(404,'Load','/tenant/load',400,0),
(405,'Statistics','/tenant/statistics',400,0),
(406,'Saving','/tenant/saving',400,1),
(407,'Tenant Bill','/tenant/bill',400,0),
(408,'Batch Analysis','/tenant/batch',400,0),
(409,'Carbon','/tenant/carbon',400,0),
(410,'Plan','/tenant/plan',400,1),
(500,'Store Data','/store',NULL,0),
(501,'Energy Category Data','/store/energycategory',500,0),
(502,'Energy Item Data','/store/energyitem',500,0),
(503,'Cost','/store/cost',500,0),
(504,'Load','/store/load',500,0),
(505,'Statistics','/store/statistics',500,0),
(506,'Saving','/store/saving',500,1),
(507,'Batch Analysis','/store/batch',500,0),
(508,'Carbon','/store/carbon',500,0),
(509,'Plan','/store/plan',500,1),
(600,'Shopfloor Data','/shopfloor',NULL,0),
(601,'Energy Category Data','/shopfloor/energycategory',600,0),
(602,'Energy Item Data','/shopfloor/energyitem',600,0),
(603,'Cost','/shopfloor/cost',600,0),
(604,'Load','/shopfloor/load',600,0),
(605,'Statistics','/shopfloor/statistics',600,0),
(606,'Saving','/shopfloor/saving',600,1),
(607,'Batch Analysis','/shopfloor/batch',600,0),
(608,'Carbon','/shopfloor/carbon',600,0),
(609,'Plan','/shopfloor/plan',600,1),
(700,'Combined Equipment Data','/combinedequipment',NULL,0),
(701,'Energy Category Data','/combinedequipment/energycategory',700,0),
(702,'Energy Item Data','/combinedequipment/energyitem',700,0),
(703,'Cost','/combinedequipment/cost',700,0),
(704,'Output','/combinedequipment/output',700,0),
(705,'Income','/combinedequipment/income',700,0),
(706,'Efficiency','/combinedequipment/efficiency',700,0),
(707,'Load','/combinedequipment/load',700,0),
(708,'Statistics','/combinedequipment/statistics',700,0),
(709,'Saving','/combinedequipment/saving',700,1),
(710,'Batch Analysis','/combinedequipment/batch',700,0),
(711,'Carbon','/combinedequipment/carbon',700,0),
(712,'Plan','/combinedequipment/plan',700,1),
(800,'Auxiliary System','/auxiliarysystem',NULL,0),
(801,'Energy Flow Diagram','/auxiliarysystem/energyflowdiagram',800,0),
(802,'Distribution System','/auxiliarysystem/distributionsystem',800,0),
(900,'Fault Detection & Diagnostics','/fdd',NULL,1),
(1000,'Monitoring','/monitoring',NULL,1),
(1001,'Space Equipments','/monitoring/spaceequipments',1000,0),
(1002,'Combined Equipments','/monitoring/combinedequipments',1000,0),
(1100,'Advanced Reporting','/advancedreporting',NULL,1),
(1200,'Knowledge Base','/knowledgebase',NULL,0),
(1300,'Microgrid','/microgrid',NULL,1),
(1301,'Microgrid Details','/microgrid/details',1300,1),
(1302,'Microgrid Reporting','/microgrid/reporting',1300,1),
(1400,'Energy Storage Power Station','/energystoragepowerstation',NULL,1),
(1401,'Energy Storage Power Station List','/energystoragepowerstation/list',1400,1),
(1402,'Energy Storage Power Station Details','/energystoragepowerstation/details',1400,1),
(1403,'Energy Storage Power Station Reporting','/energystoragepowerstation/reporting',1400,1),
(1404,'Energy Storage Power Station Alarm','/energystoragepowerstation/alarm',1400,1),
(1405,'Energy Storage Power Station Maintenance','/energystoragepowerstation/maintenance',1400,1),
(1500,'Photovoltaic Power Station','/photovoltaicpowerstation',NULL,1),
(1501,'Photovoltaic Power Station Details','/photovoltaicpowerstation/details',1500,1),
(1600,'Wind Farm','/windfarm',NULL,1),
(1601,'Wind Farm Details','/windfarm/details',1600,1),
(40000,'Work Order','/workorder',NULL,1),
(40001,'Work Order Installation','/workorder/installation',40000,1),
(40002,'Work Order Repair','/workorder/repair',40000,1),
(40003,'Work Order Inspection','/workorder/inspection',40000,1);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `hourly_low_limit` DECIMAL(18, 3) NOT NULL
  COMMENT 'Inclusive. The efault is 0. If the meter has accuracy problems, set the value to a small positive value, such as 0.100',
  `hourly_high_limit` DECIMAL(18, 3) NOT NULL
  COMMENT 'Inclusive. Maximum energy consumption per hour, Rated total active Power, Rated Flow, etc.',
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `master_meter_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_index_1` ON `myems_system_db`.`tbl_meters` (`name`);
CREATE INDEX `tbl_meters_index_2` ON `myems_system_db`.`tbl_meters` (`energy_category_id`);
CREATE INDEX `tbl_meters_index_3` ON `myems_system_db`.`tbl_meters` (`energy_item_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_points_index_1` ON `myems_system_db`.`tbl_meters_points` (`meter_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_commands_index_1` ON `myems_system_db`.`tbl_meters_commands` (`meter_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `rated_capacity` DECIMAL(18, 3) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `serial_number` VARCHAR(255) NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_index_1` ON `myems_system_db`.`tbl_microgrids` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_batteries`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_batteries` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_batteries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `battery_state_point_id` BIGINT NOT NULL,
  `soc_point_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `charge_meter_id` BIGINT NOT NULL,
  `discharge_meter_id` BIGINT NOT NULL,
  `rated_capacity` DECIMAL(18, 3) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `nominal_voltage` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_batteries_index_1` ON `myems_system_db`.`tbl_microgrids_batteries` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_commands_index_1` ON `myems_system_db`.`tbl_microgrids_commands` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_power_conversion_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_power_conversion_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_power_conversion_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `run_state_point_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(18, 3) NOT NULL,
  `today_charge_energy_point_id` BIGINT NOT NULL,
  `today_discharge_energy_point_id` BIGINT NOT NULL,
  `total_charge_energy_point_id` BIGINT NOT NULL,
  `total_discharge_energy_point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_power_conversion_systems_index_1`
ON `myems_system_db`.`tbl_microgrids_power_conversion_systems` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_evchargers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_evchargers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_evchargers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_evchargers_index_1` ON `myems_system_db`.`tbl_microgrids_evchargers` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_generators`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_generators` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_generators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_generators_index_1` ON `myems_system_db`.`tbl_microgrids_generators` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_grids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_grids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_grids_index_1` ON `myems_system_db`.`tbl_microgrids_grids` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_heatpumps`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_heatpumps` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_heatpumps` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `electricity_meter_id` BIGINT NOT NULL,
  `heat_meter_id` BIGINT NOT NULL,
  `cooling_meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_heatpumps_index_1` ON `myems_system_db`.`tbl_microgrids_heatpumps` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_loads`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_loads` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_loads_index_1` ON `myems_system_db`.`tbl_microgrids_loads` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_photovoltaics`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_photovoltaics` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_photovoltaics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_photovoltaics_index_1` ON `myems_system_db`.`tbl_microgrids_photovoltaics` (`microgrid_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_schedules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `peak_type` VARCHAR(8) NOT NULL
  COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷',
  `power` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_schedules_index_1`
ON `myems_system_db`.`tbl_microgrids_schedules` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_sensors_index_1` ON `myems_system_db`.`tbl_microgrids_sensors` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_users` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_users_index_1` ON `myems_system_db`.`tbl_microgrids_users` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `hourly_low_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Default is 0.',
  `hourly_high_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Maximum energy consumption per hour.',
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meters_index_1` ON `myems_system_db`.`tbl_offline_meters` (`name`);
CREATE INDEX `tbl_offline_meters_index_2` ON `myems_system_db`.`tbl_offline_meters` (`energy_category_id`);
CREATE INDEX `tbl_offline_meters_index_3` ON `myems_system_db`.`tbl_offline_meters` (`energy_item_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_index_1` ON `myems_system_db`.`tbl_photovoltaic_power_stations` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(512) NOT NULL,
  `data_source_id` BIGINT NOT NULL,
  `object_type` VARCHAR(32) NOT NULL,
  `units` VARCHAR(32) NOT NULL,
  `high_limit` DECIMAL(18, 3) NOT NULL,
  `low_limit` DECIMAL(18, 3) NOT NULL ,
  `higher_limit` DECIMAL(18, 3) NULL COMMENT 'Used in FDD Service',
  `lower_limit` DECIMAL(18, 3) NULL COMMENT 'Used in FDD Service',
  `is_in_alarm` BOOL DEFAULT FALSE NOT NULL COMMENT 'Used in FDD Service',
  `ratio` DECIMAL(18, 3) DEFAULT 1.000 NOT NULL,
  `is_trend` BOOL NOT NULL,
  `is_virtual` BOOL DEFAULT FALSE NOT NULL,
  `address` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_points_index_1` ON `myems_system_db`.`tbl_points` (`name`);
CREATE INDEX `tbl_points_index_2` ON `myems_system_db`.`tbl_points` (`data_source_id`);
CREATE INDEX `tbl_points_index_3` ON `myems_system_db`.`tbl_points` (`id`, `object_type`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_protocols`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_protocols` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_protocols` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_protocols_index_1` ON `myems_system_db`.`tbl_protocols` (`name`);

INSERT INTO myems_system_db.tbl_protocols (id,name,code)
VALUES
(1,'modbus-tcp', 'modbus-tcp'),
(2,'bacnet-ip', 'bacnet-ip'),
(3,'cassandra', 'cassandra'),
(4,'clickhouse', 'clickhouse'),
(5,'coap', 'coap'),
(6,'controllogix', 'controllogix'),
(7,'dlt645', 'dlt645'),
(8,'dtu-rtu', 'dtu-rtu'),
(9,'dtu-tcp', 'dtu-tcp'),
(10,'dtu-mqtt', 'dtu-mqtt'),
(11,'elexon-bmrs', 'elexon-bmrs'),
(12,'iec104', 'iec104'),
(13,'influxdb', 'influxdb'),
(14,'lora', 'lora'),
(15,'modbus-rtu', 'modbus-rtu'),
(16,'mongodb', 'mongodb'),
(17,'mqtt-acrel', 'mqtt-acrel'),
(18,'mqtt-adw300', 'mqtt-adw300'),
(19,'mqtt-huiju', 'mqtt-huiju'),
(20,'mqtt-md4220', 'mqtt-md4220'),
(21,'mqtt-seg', 'mqtt-seg'),
(22,'mqtt-weilan', 'mqtt-weilan'),
(23,'mqtt-xintianli', 'mqtt-xintianli'),
(24,'mqtt-zhongxian', 'mqtt-zhongxian'),
(25,'mqtt', 'mqtt'),
(26,'mysql', 'mysql'),
(27,'opc-ua', 'opc-ua'),
(28,'oracle', 'oracle'),
(29,'postgresql', 'postgresql'),
(30,'profibus', 'profibus'),
(31,'profinet', 'profinet'),
(32,'s7', 's7'),
(33,'simulation', 'simulation'),
(34,'sqlserver', 'sqlserver'),
(35,'tdengine', 'tdengine'),
(36,'weather', 'weather');
-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_sensors_index_1` ON `myems_system_db`.`tbl_sensors` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_sensors_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_sensors_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_sensors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sensor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_sensors_points_index_1` ON `myems_system_db`.`tbl_sensors_points` (`sensor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `area` DECIMAL(18, 3) NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `contact_id` BIGINT,
  `cost_center_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_index_1` ON `myems_system_db`.`tbl_shopfloors` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_commands_index_1` ON `myems_system_db`.`tbl_shopfloors_commands` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_equipments_index_1` ON `myems_system_db`.`tbl_shopfloors_equipments` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_meters_index_1` ON `myems_system_db`.`tbl_shopfloors_meters` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_offline_meters_index_1`
ON `myems_system_db`.`tbl_shopfloors_offline_meters` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_points_index_1` ON `myems_system_db`.`tbl_shopfloors_points` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_sensors_index_1` ON `myems_system_db`.`tbl_shopfloors_sensors` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_virtual_meters_index_1`
ON `myems_system_db`.`tbl_shopfloors_virtual_meters` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_working_calendars_index_1`
ON `myems_system_db`.`tbl_shopfloors_working_calendars` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `parent_space_id` BIGINT,
  `area` DECIMAL(18, 3) NOT NULL,
  `timezone_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `contact_id` BIGINT,
  `cost_center_id` BIGINT,
  `latitude` DECIMAL(9, 6),
  `longitude` DECIMAL(9, 6),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_index_1` ON `myems_system_db`.`tbl_spaces` (`name`);
CREATE INDEX `tbl_spaces_index_2` ON `myems_system_db`.`tbl_spaces` (`parent_space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Default Data for table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
INSERT INTO `myems_system_db`.`tbl_spaces`
(`id`, `name`, `uuid`, `parent_space_id`, `area`, `timezone_id`, `contact_id`, `is_input_counted`, `is_output_counted`,
 `cost_center_id`, `latitude`, `longitude`, `description`)
VALUES
-- DO NOT deleted the record which ID is 1. It's the root space.
(1, 'MyEMS', '9dfb7cff-f19f-4a1e-8c79-3adf6425bfd9', NULL, 99999.999, 56, 1, true, true, 1, 39.915119, 116.403963,
 'MyEMS Space');

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_combined_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_combined_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `combined_equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_combined_equipments_index_1`
ON `myems_system_db`.`tbl_spaces_combined_equipments` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_commands_index_1` ON `myems_system_db`.`tbl_spaces_commands` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_energy_storage_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_energy_storage_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_energy_storage_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_energy_storage_power_stations_index_1`
ON `myems_system_db`.`tbl_spaces_energy_storage_power_stations` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_equipments_index_1` ON `myems_system_db`.`tbl_spaces_equipments` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_meters_index_1` ON `myems_system_db`.`tbl_spaces_meters` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_microgrids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_microgrids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_microgrids_index_1` ON `myems_system_db`.`tbl_spaces_microgrids` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_offline_meters_index_1` ON `myems_system_db`.`tbl_spaces_offline_meters` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_points_index_1` ON `myems_system_db`.`tbl_spaces_points` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_sensors_index_1` ON `myems_system_db`.`tbl_spaces_sensors` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_shopfloors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_shopfloors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `shopfloor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_sensors_index_1` ON `myems_system_db`.`tbl_spaces_shopfloors` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_stores`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_stores` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_stores` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `store_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_stores_index_1` ON `myems_system_db`.`tbl_spaces_stores` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_tenants` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_tenants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `tenant_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_tenants_index_1` ON `myems_system_db`.`tbl_spaces_tenants` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_virtual_meters_index_1` ON `myems_system_db`.`tbl_spaces_virtual_meters` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_working_calendars_index_1` ON `myems_system_db`.`tbl_spaces_working_calendars` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tariffs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `tariff_type` VARCHAR(45) NOT NULL COMMENT 'Tariff Type: timeofuse - Time of Use Pricing分时费率(单一费率按平设置)\n',
  `unit_of_price` VARCHAR(45) NOT NULL,
  `valid_from_datetime_utc` DATETIME NOT NULL,
  `valid_through_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tariffs_index_1` ON `myems_system_db`.`tbl_tariffs` (`name`);
CREATE INDEX `tbl_tariffs_index_2`
ON `myems_system_db`.`tbl_tariffs` (`energy_category_id`, `valid_from_datetime_utc`, `valid_through_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tariffs_timeofuses`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs_timeofuses` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tariffs_timeofuses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tariff_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `peak_type` VARCHAR(8) NOT NULL
  COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷',
  `price` DECIMAL(18, 5) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tariffs_timeofuses_index_1`
ON `myems_system_db`.`tbl_tariffs_timeofuses` (`tariff_id`, `start_time_of_day`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `area` DECIMAL(18, 3) NOT NULL,
  `store_type_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_index_1` ON `myems_system_db`.`tbl_stores` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_commands_index_1` ON `myems_system_db`.`tbl_stores_commands` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_store_types`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_store_types` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_store_types` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `simplified_code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_types_index_1` ON `myems_system_db`.`tbl_store_types` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_stores_meters_index_1` ON `myems_system_db`.`tbl_stores_meters` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_stores_offline_meters_index_1` ON `myems_system_db`.`tbl_stores_offline_meters` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_points_index_1` ON `myems_system_db`.`tbl_stores_points` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_sensors_index_1` ON `myems_system_db`.`tbl_stores_sensors` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_virtual_meters_index_1` ON `myems_system_db`.`tbl_stores_virtual_meters` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_working_calendars_index_1` ON `myems_system_db`.`tbl_stores_working_calendars` (`store_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_svgs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_svgs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_svgs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `source_code` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_svgs_index_1` ON `myems_system_db`.`tbl_svgs` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `buildings` VARCHAR(255) NOT NULL,
  `floors` VARCHAR(255) NOT NULL,
  `rooms` VARCHAR(255) NOT NULL,
  `area` DECIMAL(18, 3) NOT NULL,
  `tenant_type_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_key_tenant` BOOL NOT NULL,
  `lease_number` VARCHAR(255) NOT NULL,
  `lease_start_datetime_utc` DATETIME NOT NULL,
  `lease_end_datetime_utc` DATETIME NOT NULL,
  `is_in_lease` BOOL NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_index_1` ON `myems_system_db`.`tbl_tenants` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_commands_index_1` ON `myems_system_db`.`tbl_tenants_commands` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenant_types`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenant_types` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenant_types` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `simplified_code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_types_index_1` ON `myems_system_db`.`tbl_tenant_types` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_tenants_meters_index_1` ON `myems_system_db`.`tbl_tenants_meters` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_tenants_offline_meters_index_1` ON `myems_system_db`.`tbl_tenants_offline_meters` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_points_index_1` ON `myems_system_db`.`tbl_tenants_points` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_sensors_index_1` ON `myems_system_db`.`tbl_tenants_sensors` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_virtual_meters_index_1` ON `myems_system_db`.`tbl_tenants_virtual_meters` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_working_calendars_index_1` ON `myems_system_db`.`tbl_tenants_working_calendars` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_timezones`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_timezones` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_timezones` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(64) NOT NULL,
  `utc_offset` VARCHAR(8) NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Data for table `myems_system_db`.`tbl_timezones`
-- ---------------------------------------------------------------------------------------------------------------------
INSERT INTO `myems_system_db`.`tbl_timezones`
(`id`, `name`, `description`, `utc_offset`)
VALUES
(1, 'Dateline Standard Time', '(GMT-12:00) International Date Line West', '-12:00'),
(2, 'Samoa Standard Time', '(GMT-11:00) Midway Island, Samoa', '-11:00'),
(3, 'Hawaiian Standard Time', '(GMT-10:00) Hawaii', '-10:00'),
(4, 'Alaskan Standard Time', '(GMT-09:00) Alaska', '-09:00'),
(5, 'Pacific Standard Time', '(GMT-08:00) Pacific Time (US and Canada) Tijuana', '-08:00'),
(6, 'Mountain Standard Time', '(GMT-07:00) Mountain Time (US and Canada)', '-07:00'),
(7, 'Mexico Standard Time 2', '(GMT-07:00) Chihuahua, La Paz, Mazatlan', '-07:00'),
(8, 'U.S. Mountain Standard Time', '(GMT-07:00) Arizona', '-07:00'),
(9, 'Central Standard Time', '(GMT-06:00) Central Time (US and Canada)', '-06:00'),
(10, 'Canada Central Standard Time', '(GMT-06:00) Saskatchewan', '-06:00'),
(11, 'Mexico Standard Time', '(GMT-06:00) Guadalajara, Mexico City, Monterrey', '-06:00'),
(12, 'Central America Standard Time', '(GMT-06:00) Central America', '-06:00'),
(13, 'Eastern Standard Time', '(GMT-05:00) Eastern Time (US and Canada)', '-05:00'),
(14, 'U.S. Eastern Standard Time', '(GMT-05:00) Indiana (East)', '-05:00'),
(15, 'S.A. Pacific Standard Time', '(GMT-05:00) Bogota, Lima, Quito', '-05:00'),
(16, 'Atlantic Standard Time', '(GMT-04:00) Atlantic Time (Canada)', '-04:00'),
(17, 'S.A. Western Standard Time', '(GMT-04:00) Georgetown, La Paz, San Juan', '-04:00'),
(18, 'Pacific S.A. Standard Time', '(GMT-04:00) Santiago', '-04:00'),
(19, 'Newfoundland and Labrador Standard Time', '(GMT-03:30) Newfoundland', '-03:30'),
(20, 'E. South America Standard Time', '(GMT-03:00) Brasilia', '-03:00'),
(21, 'S.A. Eastern Standard Time', '(GMT-03:00) Georgetown', '-03:00'),
(22, 'Greenland Standard Time', '(GMT-03:00) Greenland', '-03:00'),
(23, 'Mid-Atlantic Standard Time', '(GMT-02:00) Mid-Atlantic', '-02:00'),
(24, 'Azores Standard Time', '(GMT-01:00) Azores', '-01:00'),
(25, 'Cape Verde Standard Time', '(GMT-01:00) Cape Verde Islands', '-01:00'),
(26, 'GMT Standard Time', '(GMT) Greenwich Mean Time: Dublin, Edinburgh, Lisbon, London', '+00:00'),
(27, 'Greenwich Standard Time', '(GMT) Monrovia, Reykjavik', '+00:00'),
(28, 'Central Europe Standard Time', '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague', '+01:00'),
(29, 'Central European Standard Time', '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb', '+01:00'),
(30, 'Romance Standard Time', '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris', '+01:00'),
(31, 'W. Europe Standard Time', '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna', '+01:00'),
(32, 'W. Central Africa Standard Time', '(GMT+01:00) West Central Africa', '+01:00'),
(33, 'E. Europe Standard Time', '(GMT+02:00) Minsk', '+02:00'),
(34, 'Egypt Standard Time', '(GMT+02:00) Cairo', '+02:00'),
(35, 'FLE Standard Time', '(GMT+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius', '+02:00'),
(36, 'GTB Standard Time', '(GMT+02:00) Athens, Bucharest, Istanbul', '+02:00'),
(37, 'Israel Standard Time', '(GMT+02:00) Jerusalem', '+02:00'),
(38, 'South Africa Standard Time', '(GMT+02:00) Harare, Pretoria', '+02:00'),
(39, 'Russian Standard Time', '(GMT+03:00) Moscow, St. Petersburg, Volgograd', '+03:00'),
(40, 'Arab Standard Time', '(GMT+03:00) Kuwait, Riyadh', '+03:00'),
(41, 'E. Africa Standard Time', '(GMT+03:00) Nairobi', '+03:00'),
(42, 'Arabic Standard Time', '(GMT+03:00) Baghdad', '+03:00'),
(43, 'Iran Standard Time', '(GMT+03:30) Tehran', '+03:30'),
(44, 'Arabian Standard Time', '(GMT+04:00) Abu Dhabi, Muscat', '+04:00'),
(45, 'Caucasus Standard Time', '(GMT+04:00) Baku, Tbilisi, Yerevan', '+04:00'),
(46, 'Transitional Islamic State of Afghanistan Standard Time', '(GMT+04:30) Kabul', '+04:30'),
(47, 'Ekaterinburg Standard Time', '(GMT+05:00) Ekaterinburg', '+05:00'),
(48, 'West Asia Standard Time', '(GMT+05:00) Tashkent', '+05:00'),
(49, 'India Standard Time', '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi', '+05:30'),
(50, 'Central Asia Standard Time', '(GMT+06:00) Astana, Dhaka', '+06:00'),
(51, 'Sri Lanka Standard Time', '(GMT+06:00) Sri Jayawardenepura', '+06:00'),
(52, 'N. Central Asia Standard Time', '(GMT+06:00) Almaty, Novosibirsk', '+06:00'),
(53, 'Myanmar Standard Time', '(GMT+06:30) Yangon (Rangoon)', '+06:30'),
(54, 'S.E. Asia Standard Time', '(GMT+07:00) Bangkok, Hanoi, Jakarta', '+07:00'),
(55, 'North Asia Standard Time', '(GMT+07:00) Krasnoyarsk', '+07:00'),
(56, 'China Standard Time', '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi', '+08:00'),
(57, 'Singapore Standard Time', '(GMT+08:00) Kuala Lumpur, Singapore', '+08:00'),
(58, 'Taipei Standard Time', '(GMT+08:00) Taipei', '+08:00'),
(59, 'W. Australia Standard Time', '(GMT+08:00) Perth', '+08:00'),
(60, 'North Asia East Standard Time', '(GMT+08:00) Irkutsk, Ulaanbaatar', '+08:00'),
(61, 'Korea Standard Time', '(GMT+09:00) Seoul', '+09:00'),
(62, 'Tokyo Standard Time', '(GMT+09:00) Osaka, Sapporo, Tokyo', '+09:00'),
(63, 'Yakutsk Standard Time', '(GMT+09:00) Yakutsk', '+09:00'),
(64, 'A.U.S. Central Standard Time', '(GMT+09:30) Darwin', '+09:30'),
(65, 'Cen. Australia Standard Time', '(GMT+09:30) Adelaide', '+09:30'),
(66, 'A.U.S. Eastern Standard Time', '(GMT+10:00) Canberra, Melbourne, Sydney', '+10:00'),
(67, 'E. Australia Standard Time', '(GMT+10:00) Brisbane', '+10:00'),
(68, 'Tasmania Standard Time', '(GMT+10:00) Hobart', '+10:00'),
(69, 'Vladivostok Standard Time', '(GMT+10:00) Vladivostok', '+10:00'),
(70, 'West Pacific Standard Time', '(GMT+10:00) Guam, Port Moresby', '+10:00'),
(71, 'Central Pacific Standard Time', '(GMT+11:00) Magadan, Solomon Islands, New Caledonia', '+11:00'),
(72, 'Fiji Islands Standard Time', '(GMT+12:00) Fiji, Kamchatka, Marshall Is.', '+12:00'),
(73, 'New Zealand Standard Time', '(GMT+12:00) Auckland, Wellington', '+12:00'),
(74, 'Tonga Standard Time', '(GMT+13:00) Nuku\'alofa', '+13:00'),
(75, 'Azerbaijan Standard Time', '(GMT-03:00) Buenos Aires', '-03:00'),
(76, 'Middle East Standard Time', '(GMT+02:00) Beirut', '+02:00'),
(77, 'Jordan Standard Time', '(GMT+02:00) Amman', '+02:00'),
(78, 'Central Standard Time (Mexico)', '(GMT-06:00) Guadalajara, Mexico City, Monterrey - New', '-06:00'),
(79, 'Mountain Standard Time (Mexico)', '(GMT-07:00) Chihuahua, La Paz, Mazatlan - New', '-07:00'),
(80, 'Pacific Standard Time (Mexico)', '(GMT-08:00) Tijuana, Baja California', '-08:00'),
(81, 'Namibia Standard Time', '(GMT+02:00) Windhoek', '+02:00'),
(82, 'Georgian Standard Time', '(GMT+03:00) Tbilisi', '+03:00'),
(83, 'Central Brazilian Standard Time', '(GMT-04:00) Manaus', '-04:00'),
(84, 'Montevideo Standard Time', '(GMT-03:00) Montevideo', '-03:00'),
(85, 'Armenian Standard Time', '(GMT+04:00) Yerevan', '+04:00'),
(86, 'Venezuela Standard Time', '(GMT-04:30) Caracas', '-04:30'),
(87, 'Argentina Standard Time', '(GMT-03:00) Buenos Aires', '-03:00'),
(88, 'Morocco Standard Time', '(GMT) Casablanca', '+00:00'),
(89, 'Pakistan Standard Time', '(GMT+05:00) Islamabad, Karachi', '+05:00'),
(90, 'Mauritius Standard Time', '(GMT+04:00) Port Louis', '+04:00'),
(91, 'UTC', '(GMT) Coordinated Universal Time', '+00:00'),
(92, 'Paraguay Standard Time', '(GMT-04:00) Asuncion', '-04:00'),
(93, 'Kamchatka Standard Time', '(GMT+12:00) Petropavlovsk-Kamchatsky', '+12:00');

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `equation` LONGTEXT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meters_index_1` ON `myems_system_db`.`tbl_virtual_meters` (`name`);
CREATE INDEX `tbl_virtual_meters_index_2` ON `myems_system_db`.`tbl_virtual_meters` (`energy_category_id`);
CREATE INDEX `tbl_virtual_meters_index_3` ON `myems_system_db`.`tbl_virtual_meters` (`energy_item_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_variables`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_variables` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_variables` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` CHAR(36) NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `meter_type` VARCHAR(32) NOT NULL COMMENT 'meter, virtual_meter, offline_meter',
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_variables_index_1` ON `myems_system_db`.`tbl_variables` (`virtual_meter_id`);
CREATE INDEX `tbl_variables_index_2`
ON `myems_system_db`.`tbl_variables` (`meter_id`, `meter_type`, `virtual_meter_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_virtual_power_plants`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_virtual_power_plants` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_power_plants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `balancing_price_point_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_power_plants_index_1` ON `myems_system_db`.`tbl_virtual_power_plants` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_virtual_power_plants_microgrids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_virtual_power_plants_microgrids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_power_plants_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_power_plant_id` BIGINT NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_power_plants_microgrids_index_1`
ON `myems_system_db`.`tbl_virtual_power_plants_microgrids` (`virtual_power_plant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_versions` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_versions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `version` VARCHAR(256) NOT NULL,
  `release_date` DATE NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Data for table `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------
INSERT INTO `myems_system_db`.`tbl_versions`
(`id`, `version`, `release_date`)
VALUES
(1, '4.8.0RC', '2024-08-08');

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_wind_farms`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_wind_farms` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_wind_farms` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `rated_power` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_wind_farms_index_1` ON `myems_system_db`.`tbl_wind_farms` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(64),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_working_calendars_index_1` ON `myems_system_db`.`tbl_working_calendars` (`name`);

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
CREATE INDEX `tbl_working_calendars_non_working_days_index_1`
ON `myems_system_db`.`tbl_working_calendars_non_working_days` (`working_calendar_id`);

-- MyEMS User Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_user_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_user_db` ;
CREATE DATABASE IF NOT EXISTS `myems_user_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
USE `myems_user_db` ;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table structure for `myems_user_db`.tbl_api_keys
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_api_keys`;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_api_keys`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `expires_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_api_keys_index_1` ON `myems_user_db`.`tbl_api_keys` (`created_datetime_utc`, `name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_email_messages`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_email_messages`;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_email_messages`  (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `recipient_name` VARCHAR(128) NOT NULL,
  `recipient_email` VARCHAR(128) NOT NULL,
  `subject` VARCHAR(128) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `attachment_file_name` VARCHAR(128) NULL DEFAULT NULL,
  `attachment_file_object` LONGBLOB NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `scheduled_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, sent, timeout',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_email_messages_index_1` ON `myems_user_db`.`tbl_email_messages` (`status`, `scheduled_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_email_message_sessions`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_email_message_sessions`;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_email_message_sessions`  (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `recipient_email` VARCHAR(128) NOT NULL,
  `token` VARCHAR(128) NOT NULL,
  `expires_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_email_message_sessions_index_1` ON `myems_user_db`.`tbl_email_message_sessions` (`recipient_email`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_users` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `display_name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `salt` VARCHAR(128) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  `is_admin` BOOL NOT NULL ,
  `is_read_only` BOOL NOT NULL DEFAULT 0,
  `privilege_id` BIGINT NULL,
  `account_expiration_datetime_utc` DATETIME NOT NULL,
  `password_expiration_datetime_utc` DATETIME NOT NULL,
  `failed_login_count` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

-- --------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_user_db`.`tbl_users`
-- --------------------------------------------------------------------------------------------------------------------
-- default username: administrator
-- default password: !MyEMS1
INSERT INTO `myems_user_db`.`tbl_users`(`id`, `name`, `uuid`, `display_name`, `email`, `salt`, `password`, `is_admin`,
 `privilege_id`, `account_expiration_datetime_utc`, `password_expiration_datetime_utc`, `failed_login_count`)
VALUES
(1, 'administrator', 'dcdb67d1-6116-4987-916f-6fc6cf2bc0e4', 'Administrator', 'administrator@myems.io',
 'adfd6fb6d78d4e3780ebdd6afdec2c3a',
 'bc00df65270b1a72b9ed37136fa95a695896edc8c114391821f5edc6b1bbdbabc3d449962f8d1c7a4ec3f2d0a1a79055623963d88ecb9b778423194ff7b6be42',
 1, NULL, '2099-12-31 16:00:00', '2099-12-31 16:00:00', 0);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_privileges`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_privileges` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_privileges` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `data` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_sessions`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_sessions` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_uuid` CHAR(36) NOT NULL,
  `token` VARCHAR(128) NOT NULL,
  `utc_expires` DATETIME NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_logs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_logs` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_uuid` CHAR(36) NOT NULL,
  `request_datetime_utc` DATETIME NOT NULL,
  `request_method` VARCHAR(256) NOT NULL,
  `resource_type` VARCHAR(256) NOT NULL,
  `resource_id` BIGINT NULL,
  `request_body` LONGTEXT NULL COMMENT 'MUST be in JSON format',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_logs_index_1` ON `myems_user_db`.`tbl_logs` (`user_uuid`, `request_datetime_utc`, `request_method`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_new_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_new_users` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_new_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `display_name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `salt` VARCHAR(128) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_notifications`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_notifications` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'unread, read, archived',
  `subject` VARCHAR(128) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `url` VARCHAR(128),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_notifications_index_1`
ON `myems_user_db`.`tbl_notifications` (`user_id`, `created_datetime_utc`, `status`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table structure for `myems_user_db`.tbl_verification_codes
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_verification_codes`;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_verification_codes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_email` VARCHAR(128) NOT NULL,
  `verification_code` VARCHAR(128) NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `expires_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_verirication_codes_index_1`
ON `myems_user_db`.`tbl_verification_codes` (`recipient_email`, `created_datetime_utc`);




-- MyEMS System Database Demo Data

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_combined_equipments`
(`id`, `name`, `uuid`,  `is_input_counted`, `is_output_counted`, `cost_center_id`, `svg_id`, `camera_url`, `description` )
VALUES
(1, '组合式设备1', '48aab70f-2e32-4518-9986-a6b7395acf58', 1, 0, 1, 1, '', 'description'),
(2, '组合式设备2', 'c235e68c-e1be-4d7a-84e7-976c83ff6e44', 1, 0, 1, 1, '', 'description');

COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_equipments`
(`id`, `combined_equipment_id`, `equipment_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_meters`
(`combined_equipment_id`, `meter_id`, `is_output`)
VALUES
(1, 1, 0);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_offline_meters`
(`combined_equipment_id`, `offline_meter_id`, `is_output`)
VALUES
(1, 1, 0);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_parameters`
(`combined_equipment_id`, `name`, `parameter_type`, `constant`, `point_id`, `numerator_meter_uuid`, `denominator_meter_uuid`)
VALUES
(1, 'serial number', 'constant', 'bfa8b106', NULL, NULL, NULL),
(1, 'manufacturer', 'constant', 'York', NULL, NULL, NULL),
(1, 'maintainer', 'constant', 'Johnson Controls', NULL, NULL, NULL),
(1, 'use life start', 'constant', '2016-01-01', NULL, NULL, NULL),
(1, 'use life end', 'constant', '2025-12-31', NULL, NULL, NULL),
(1, 'model number', 'constant', 'CH01', NULL, NULL, NULL),
(1, 'nominal cooling capacity', 'constant', '90.000 kW', NULL, NULL, NULL),
(1, 'nominal cooling input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(1, 'nominal cooling cop', 'constant', '5', NULL, NULL, NULL),
(1, 'nominal cooling operating current', 'constant', '120.000 A', NULL, NULL, NULL),
(1, 'rated input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(1, 'nominal chilled water flow rate', 'constant', '30 m2/h', NULL, NULL, NULL),
(1, 'nominal cooling water flow_rate', 'constant', '50 m2/h', NULL, NULL, NULL),
(1, 'status', 'point', NULL, 1, NULL, NULL),
(1, 'inlet chilled water temperature', 'point', NULL, 2, NULL, NULL),
(1, 'chilled_water instantaneous flow rate', 'point', NULL, 3, NULL, NULL),
(1, 'instantaneous power', 'point', NULL, 4, NULL, NULL),
(1, 'COP', 'fraction', NULL, NULL, '5ca47bc5-22c2-47fc-b906-33222191ea40', '6db58cd6-33d3-58ed-a095-22333202fb51');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_virtual_meters`
(`combined_equipment_id`, `virtual_meter_id`, `is_output`)
VALUES
(1, 1, 0);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_contacts`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_contacts`(`id`, `name`, `uuid`, `email`, `phone`, `description`)
VALUES
(1, '江工', '5c5ce6e8-8d00-46b3-9602-4e1520a8b43f',  'john@myems.io', '+8613888888888', '一号楼'),
(2, '张工', '102b654d-e831-4365-bb1e-dbd55e897851',  'sample.tenant@myems.io', '+8613666666666', '主力租户');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_cost_centers`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_cost_centers`
(`id`, `name`, `uuid`, `external_id`)
VALUES
(1, '成本中心', 'd97b9736-c4f9-4005-a534-6af3487303ad', NULL);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_cost_centers_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_cost_centers_tariffs`
(`cost_center_id`, `tariff_id`)
VALUES
(1, 1),
(1, 2),
(1, 3);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_data_sources`
(`id`, `name`, `uuid`,`gateway_id`, `protocol`,  `connection`)
VALUES
(1, '示例ModbusTCP数据源', 'b3ace9d4-b63b-419b-818f-0f6d1d0603a4', 1, 'modbus-tcp', '{"host":"192.168.0.1", "port":502, "interval_in_seconds":60}'),
(2, '示例ModbusRTU数据源*企业版*', 'b903f0af-9115-448c-9d46-8caf5f9995f3', 1, 'modbus-rtu', '{"port": "/dev/ttyUSB0","slaveaddress": 1, "baudrate": 9600,"bytesize": 8,"parity": "N","stopbits": 1,"timeout": 0.05,"mode": "rtu"}'),
(3, '示例Bacnet/IP数据源*企业版*', 'e2d5b30b-b554-4ebe-8ce7-f377ab380d19', 1, 'bacnet-ip', '{"host":"192.168.0.3", "port":47808}'),
(4, '示例S7数据源*企业版*', '9eb0d705-d02a-43f8-9c62-7e5ef508b255', 1, 's7', '{"host":"192.168.0.4", "port":102, "rack": 0, "slot": 2}'),
(5, '示例ControlLogix数据源*企业版*', 'd1dc9792-7861-4dd3-9b01-07511dae16c1', 1, 'controllogix', '{"host":"192.168.0.5","port":44818,"processorslot":3}'),
(6, '示例OPU UA数据源*企业版*', '56e1c642-8032-495b-af2e-18a77ca75e0f', 1, 'opc-ua', '{"url":"opc.tcp://192.168.0.6:49320/OPCUA/SimulationServer/"}'),
(7, '示例天气数据源*企业版*', '9bff8e95-c7c9-4002-b040-08a96ae196b5', 1, 'weather', '{"base_url":"WEATHER_API_URL", "location":"beijing", "key":"APPKEY"}'),
(8, '示例MySQL数据源*企业版*', '409439d0-3e0a-4ab3-865a-a5c0329925f8', 1, 'mysql', '{"host":"192.168.0.8", "port":3306, "user":"myems", "password":"!MyEMS1", "database":"myems_ingestion_db" }'),
(9, '示例SQL Server数据源*企业版*', '025f0429-5088-4f2a-85a3-dff9b4523692', 1, 'sqlserver', '{"host":"192.168.0.9", "port":1433, "user":"myems", "password":"!MyEMS1", "database":"myems_ingestion_db" }'),
(10, '示例PostgreSQL数据源*企业版*', 'd89b81e6-4917-4a84-b0e9-c2e939599d3a', 1, 'postgresql', '{"host":"192.168.0.10", "port":5432, "user":"myems", "password":"!MyEMS1", "database":"myems_ingestion_db" }'),
(11, '示例Oracle数据源*企业版*', '1bdf4db8-ea71-433e-ad16-b637275073d7', 1, 'oracle', '{"dsn":"192.168.0.11:1521/myems", "user":"myems", "password":"!MyEMS1"}'),
(13, '示例InfluxDB数据源*企业版*', '79cb60ff-c683-4289-ac69-bd13e1f970d1', 1, 'influxdb', '{"url":"http://192.168.0.13:8086", "token":"MYEMSINFLUXDBTOKEN", "org":"myems", "bucket":"myems"}'),
(14, '示例MQTT数据源*企业版*', 'e3d56e11-00da-4957-ab0b-1d761dc8b89f', 1, 'mqtt', '{"host":"192.168.1.101", "port":1883, "user":"myems", "password":"!MyEMS1", "topic":"myems", "qos":2 }');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_distribution_circuits`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_distribution_circuits`
(`id`, `name`, `uuid`, `distribution_system_id`, `distribution_room`, `switchgear`, `peak_load`, `peak_current`, `customers`, `meters`)
VALUES
(1, 'AHa01', '52f7abe1-ba0e-47a6-a327-4faac42a1d11', 1, '1ES', 'AHa01', 5100, 1250, '11#电源进线1WHj2', 'AHa01');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_distribution_circuits_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_distribution_circuits_points`
(`distribution_circuit_id`, `point_id`)
VALUES
(1, 1);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_distribution_systems`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_distribution_systems`
(`id`, `name`, `uuid`, `svg_id`,  `description`)
VALUES
(1, '示例配电系统', '95652719-56fa-44cc-9bef-7aa47664d4ff', 1, 'demo distribution system');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_categories`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_energy_categories`
(`id`, `name`, `uuid`, `unit_of_measure`, `kgce`, `kgco2e`)
VALUES
(1, '电', '6d0753ed-8b43-4332-b6fd-d2f5813831d3', 'kWh', 0.122, 0.928),
(2, '自来水', '3dbfa598-fccc-4d60-bf11-14bd55540c66', 'm³', 0.085, 0.910),
(3, '天然气', '6d0753ed-8b43-4332-b6fd-d2f5813831d3', 'm³', 1.330, 2.162),
(4,'4℃冷冻水','d2a3021a-4911-4611-856e-80133000f1d5','m³',1.000,1.000),
(5,'7℃冷冻水','c1ad0696-e1ab-4e0c-a342-b194c0bc27e0','m³',1.000,1.000),
(6,'蒸汽','ac91a5c4-4ae5-4a73-8e3f-044591f42eef','T',1.000,1.000),
(7,'压缩空气','ff238e98-cd35-47c5-88a3-00617587775d','m³',1.000,1.000),
(8,'循环水','7e159a34-b2e6-4fd3-ba76-897d134abe06','m³',1.000,1.000),
(9, '热量','549f9cad-8db7-49d2-9473-95e37a3fc46a','KJ',1.000,1.000),
(10, '冷量','05aa257b-3cf6-4f19-808d-92e7dbf52b16','KJ',1.000,1.000),
(11, '中水','df6161b6-4a1b-46e7-b7c8-337b5b52d717','m³',1.000,1.000);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_items`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO myems_system_db.tbl_energy_items
(id, name, uuid, energy_category_id)
VALUES
(1, '照明和插座用电', 'cade4e78-2b85-4bea-ab6e-0d6accc88d03', 1),
(2, '走廊和应急照明用电', '7a6dc086-ce08-4d66-ba75-f69af92b32f4', 1),
(3, '室外景观照明用电', 'abcebbd1-b770-4e7c-ae54-8434d724522c', 1),
(4, '冷热站用电', '97cdea54-04c7-4a6a-b4c2-df15874b2f49', 1),
(5, '空调末端用电', '84ab7262-33fb-43a1-9880-9287cc268cc0', 1),
(6, '电梯用电', '26a5fc62-3da1-41b0-bcb1-0056e25ee121', 1),
(7, '水泵用电', 'fc6079f5-01a4-434f-9004-9382e8c3dd47', 1),
(8, '通风机用电', 'a4bf68cd-6ae1-48dd-b281-07c95312921d', 1),
(9, '特殊用电', '1990d151-02ff-4fd6-b298-2b2edee4e0ea', 1);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_flow_diagrams`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams`
(`id`, `name`, `uuid`)
VALUES
(1, '示例能流图', '3ccbc9c6-9575-4212-a63a-a688d1154302');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_flow_diagrams_links`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams_links`
(`id`, `energy_flow_diagram_id`, `source_node_id`, `target_node_id`, `meter_uuid`)
VALUES
(1, 1, 1, 3, '5ca47bc5-22c2-47fc-b906-33222191ea40'),
(2, 1, 2, 4, 'd6f3f56b-10ee-4d22-ad47-5acc1353a6f4'),
(3, 1, 2, 5, '6db58cd6-33d3-58ed-a095-22333202fb51'),
(4, 1, 2, 6, '3fff2cfb-f755-44c8-a919-6135205a8573'),
(5, 1, 3, 7, '62f473e0-1a35-41f3-9c30-8110d75d65bb'),
(6, 1, 3, 8, '5ca47bc5-22c2-47fc-b906-33222191ea40'),
(7, 1, 4, 9, 'd6f3f56b-10ee-4d22-ad47-5acc1353a6f4'),
(8, 1, 4, 10, '6db58cd6-33d3-58ed-a095-22333202fb51');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
(`id`, `energy_flow_diagram_id`, `name`)
VALUES
(1, 1, '10KV进线#1'),
(2, 1, '10KV进线#2'),
(3, 1, '租区'),
(4, 1, '公区'),
(5, 1, '酒店'),
(6, 1, '车库'),
(7, 1, '餐饮'),
(8, 1, '零售'),
(9, 1, '照明'),
(10, 1, '电梯');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_equipments`
(`id`, `name`, `uuid`,  `is_input_counted`, `is_output_counted`, `cost_center_id`, `svg_id`, `camera_url`, `description` )
VALUES
(1, '设备1', 'bfa8b106-89a1-49ca-9b2b-a481ac41a873', 1, 0, 1, 1, '', 'description'),
(2, '设备2', 'ad5798ec-d827-43d9-bf08-fc7516f9c4c8', 1, 0, 1, 1, '', 'description');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_equipments_meters`
(`equipment_id`, `meter_id`, `is_output`)
VALUES
(1, 1, 0);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_equipments_offline_meters`
(`equipment_id`, `offline_meter_id`, `is_output`)
VALUES
(1, 1, 0);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_equipments_parameters`
(`equipment_id`, `name`, `parameter_type`, `constant`, `point_id`, `numerator_meter_uuid`, `denominator_meter_uuid`)
VALUES
(1, 'serial number', 'constant', 'bfa8b106', NULL, NULL, NULL),
(1, 'manufacturer', 'constant', 'York', NULL, NULL, NULL),
(1, 'maintainer', 'constant', 'Johnson Controls', NULL, NULL, NULL),
(1, 'use life start', 'constant', '2016-01-01', NULL, NULL, NULL),
(1, 'use life end', 'constant', '2025-12-31', NULL, NULL, NULL),
(1, 'model number', 'constant', 'CH01', NULL, NULL, NULL),
(1, 'nominal cooling capacity', 'constant', '90.000 kW', NULL, NULL, NULL),
(1, 'nominal cooling input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(1, 'nominal cooling cop', 'constant', '5', NULL, NULL, NULL),
(1, 'nominal cooling operating current', 'constant', '120.000 A', NULL, NULL, NULL),
(1, 'rated input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(1, 'nominal chilled water flow rate', 'constant', '30 m2/h', NULL, NULL, NULL),
(1, 'nominal cooling water flow_rate', 'constant', '50 m2/h', NULL, NULL, NULL),
(1, 'status', 'point', NULL, 1, NULL, NULL),
(1, 'inlet chilled water temperature', 'point', NULL, 2, NULL, NULL),
(1, 'chilled_water instantaneous flow rate', 'point', NULL, 3, NULL, NULL),
(1, 'instantaneous power', 'point', NULL, 4, NULL, NULL),
(1, 'COP', 'fraction', NULL, NULL, '5ca47bc5-22c2-47fc-b906-33222191ea40', '6db58cd6-33d3-58ed-a095-22333202fb51');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_equipments_virtual_meters`
(`equipment_id`, `virtual_meter_id`, `is_output`)
VALUES
(1, 1, 0);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_gateways`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_gateways`
(`id`, `name`, `uuid`, `token`,  `last_seen_datetime_utc`)
VALUES
(2, '网关2', '8f75c0ab-9296-49c7-9058-8139febd0c31', 'd3860971-e6e0-4c98-9eba-5492869c5b19', null);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_knowledge_files`
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_meters`
(`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `hourly_low_limit`, `hourly_high_limit`, `cost_center_id`, `energy_item_id`, `master_meter_id`, `description`)
VALUES
(1, '计量表1', '5ca47bc5-22c2-47fc-b906-33222191ea40', 1, 1, 0.000, 999.999, 1, 1, null, 'meter1'),
(2, '计量表2', 'd6f3f56b-10ee-4d22-ad47-5acc1353a6f4', 1, 1, 0.000, 999.999, 1, 1, 1,  'meter2'),
(3, '计量表3', '6db58cd6-33d3-58ed-a095-22333202fb51', 1, 1, 0.000, 999.999, 1, 1, 1,  'meter3');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_meters_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_meters_points`
(`meter_id`, `point_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_offline_meters`
(`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `hourly_low_limit`, `hourly_high_limit`, `cost_center_id`, `energy_item_id`, `description`)
VALUES
(1, '离线表1', '62f473e0-1a35-41f3-9c30-8110d75d65bb', 1, 1, 0.0, 999.999, 1, 1, 'offlinemeter1');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- List of Object Type
-- ENERGY_VALUE
-- ANALOG_VALUE
-- DIGITAL_VALUE

START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_points`
(`id`, `name`, `data_source_id`, `object_type`, `units`, `high_limit`, `low_limit`, `ratio`, `is_trend`, `is_virtual`, `address`, `description` )
VALUES
(1, 'Active Energy Import Tariff 1', 1, 'ENERGY_VALUE', 'kWh', 99999999999, 0, 1.000, 1, 0,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":801, \"number_of_registers\":4, \"format\":\"=d\", \"byte_swap\":false}', null),

(2, 'Working hours counter', 1, 'ANALOG_VALUE',  'S', 999999999, 0, 1.000, 1, 0,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":209, \"number_of_registers\":2, \"format\":\"=L\", \"byte_swap\":true}', null),

(3, 'Current a', 1, 'ANALOG_VALUE',  'A', 5, 0, 1.000, 1, 0,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":13, \"number_of_registers\":2, \"format\":\"=f\", \"byte_swap\":false}', null),

(4, 'Active Power a', 1, 'ANALOG_VALUE',  'W', 3450, 0, 1.000, 1, 0,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":25, \"number_of_registers\":2, \"format\":\"=f\", \"byte_swap\":false}', null),

(5, 'Power Factor a', 1, 'ANALOG_VALUE',  'W', 1, 0, 1.000, 1, 0,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":37, \"number_of_registers\":2, \"format\":\"=f\", \"byte_swap\":false}', null),

(6, 'ModbusTCP示例数据点6', 2, 'ENERGY_VALUE',  'Wh', 99999999999, 0, 1.000, 1, 0,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":40001, \"number_of_registers\":2, \"format\":\"=f\", \"byte_swap\":false}', null),

(7, '示例数据点7', 2, 'ANALOG_VALUE',  'V', 690, 0, 1.000, 1, 0,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":40002, \"number_of_registers\":2, \"format\":\"=f\", \"byte_swap\":false}', null),

(8, 'BACnet示例数据点1', 3, 'ANALOG_VALUE',  'V', 690, 0, 1.000, 1, 0,
  '{\"object_type\":\"analogValue\", \"object_id\":3004860, \"property_name\":\"presentValue\", \"property_array_index\":null}', null),
-- BACnet Object Type
-- analogValue, analogInput, analogOutput, binaryValue, binaryInput, binaryOutput

(9, 'S7示例数据点1', 4, 'ANALOG_VALUE',  'kWh', 99999999999, 0, 1.000, 1, 0,
  '{\"area\":\"DB\", \"db_number\":700, \"start\":8, \"size\":4}', null);
-- # S7 Area
-- 'PE', 'PA', 'MK', 'DB', 'CT', 'TM'

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_sensors`
(`id`, `name`, `uuid`, `description`)
VALUES
(1, '传感器1', 'ba450606-6f39-41e0-8caf-75b528635511', 'sensor description');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_sensors_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_sensors_points`
(`id`, `sensor_id`, `point_id`)
VALUES (1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_shopfloors`
(`id`, `name`, `uuid` , `area`, `contact_id`, `is_input_counted`,  `cost_center_id`, `description`)
VALUES
(1, '车间1', 'd03837fd-9d30-44fe-9443-154f7c7e15f1',  99999.999, 1, 1, 1,  'MyEMS Project');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_shopfloors_equipments`
(`shopfloor_id`, `equipment_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_shopfloors_meters`
(`shopfloor_id`, `meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_shopfloors_offline_meters`
(`shopfloor_id`, `offline_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_shopfloors_sensors`
(`shopfloor_id`, `sensor_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_shopfloors_virtual_meters`
(`shopfloor_id`, `virtual_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_shopfloors_points`
(`shopfloor_id`, `point_id`)
VALUES
(1, 1),
(1, 2),
(1, 3);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces`
(`id`, `name`, `uuid`, `parent_space_id`, `area`, `timezone_id`, `contact_id`, `is_input_counted`, `is_output_counted`, `cost_center_id`, `description`)
VALUES
(2, '1号楼', '8f25b33b-db93-49b3-b0f8-b01e0c19df29', 1, 88888.888, 56, 1, 1, 1, 1,  'MyEMS Project'),
(3, '2号楼', '195d7ea8-17b4-4e9c-bb37-546428155438', 1, 66666.666, 56, 1, 1, 1, 1, 'MyEMS Project'),
(10000, '调试空间', '2c44a292-eb0c-49a3-a50e-4fc03858dc0c', 1, 88888.888, 56, 1, 1, 1, 1,  'MyEMS Project');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_combined_equipments`
(`space_id`, `combined_equipment_id`)
VALUES
(10000, 1),
(10000, 2);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_equipments`
(`space_id`, `equipment_id`)
VALUES
(10000, 1),
(10000, 2);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_meters`
(`space_id`, `meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_offline_meters`
(`space_id`, `offline_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_sensors`
(`space_id`, `sensor_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_shopfloors`
(`space_id`, `shopfloor_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_stores`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_stores`
(`space_id`, `store_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_tenants`
(`space_id`, `tenant_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_virtual_meters`
(`space_id`, `virtual_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_spaces_points`
(`space_id`, `point_id`)
VALUES
(1, 1),
(1, 2),
(1, 3);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_svgs`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_svgs`
(`id`, `name`, `uuid`, `source_code`,  `description`)
VALUES
(1, 'SVG1', 'a0e79d2e-8756-457e-b1f2-4152e3591bff', '<?xml version="1.0" encoding="UTF-8"?><svg width="5cm" height="4cm" version="1.1" xmlns="http://www.w3.org/2000/svg"><desc>Four separate rectangles</desc><rect x=".5cm" y=".5cm" width="2cm" height="1cm"/></svg>', 'demo svg');

COMMIT;
-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tariffs`
(`id`, `name`, `uuid`, `energy_category_id`, `tariff_type`, `unit_of_price`, `valid_from_datetime_utc`, `valid_through_datetime_utc`)
VALUES
(1, '2025分时电价1-6',    '590efb36-8587-42a9-ae6f-c715d21496d6', 1, 'timeofuse', '元/千瓦时', '2024-12-31 16:00:00', '2025-06-30 15:59:59'),
(2, '2025分时电价7-9',    'f5966640-18fc-437a-9efd-cbc0c58b6373', 1, 'timeofuse', '元/千瓦时', '2025-06-30 16:00:00', '2025-09-30 15:59:59'),
(3, '2025分时电价10-12',  '21727a1b-4b27-4186-b72e-db46e6e2d980', 1, 'timeofuse', '元/千瓦时', '2025-09-30 16:00:00', '2025-12-31 15:59:59'),
(4, '2022分时电价1-6',    'fe65e443-0ec2-4a16-823e-2365885e2598', 1, 'timeofuse', '元/千瓦时', '2021-12-31 16:00:00', '2022-06-30 15:59:59'),
(5, '2022分时电价7-9',    'd1285c81-4612-4d7c-9436-ed11b4e7abe4', 1, 'timeofuse', '元/千瓦时', '2022-06-30 16:00:00', '2022-09-30 15:59:59'),
(6, '2022分时电价10-12',  'e6c275b4-47eb-4f5d-bc59-edbe45c2a407', 1, 'timeofuse', '元/千瓦时', '2022-09-30 16:00:00', '2022-12-31 15:59:59'),
(7, '2023分时电价1-6',    'ca359f72-48ad-46a7-82af-cecbe98450e8', 1, 'timeofuse', '元/千瓦时', '2022-12-31 16:00:00', '2023-06-30 15:59:59'),
(8, '2023分时电价7-9',    '9fdda603-0f8f-4452-ad59-c5df54bc35f4', 1, 'timeofuse', '元/千瓦时', '2023-06-30 16:00:00', '2023-09-30 15:59:59'),
(9, '2023分时电价10-12',  'fb0442e7-4d44-4bfd-8b20-cad3f77a2480', 1, 'timeofuse', '元/千瓦时', '2023-09-30 16:00:00', '2023-12-31 15:59:59'),
(10, '2024分时电价1-6',   '3fa6e1f2-7d08-4f5a-bcbf-beb041d569c0', 1, 'timeofuse', '元/千瓦时', '2023-12-31 16:00:00', '2024-06-30 15:59:59'),
(11, '2024分时电价7-9',   '787240fb-1694-403e-a0a7-83d7be1cc0b8', 1, 'timeofuse', '元/千瓦时', '2024-06-30 16:00:00', '2024-09-30 15:59:59'),
(12, '2024分时电价10-12', 'a07fdf76-edcf-4124-96e7-ab733a5a4b70', 1, 'timeofuse', '元/千瓦时', '2024-09-30 16:00:00', '2024-12-31 15:59:59'),
(13, '自来水',  '6fcbc77e-effb-4d43-9b30-77b062435d34', 2, 'timeofuse', '元/m³',    '2021-12-31 16:00:00', '2025-12-31 15:59:59'),
(14, '天然气', '6a4c56ff-b3e1-4555-9b1c-87d05bcfa4d9', 3, 'timeofuse', '元/m³',    '2021-12-31 16:00:00', '2025-12-31 15:59:59');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tariffs_timeofuses`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tariffs_timeofuses`
(`tariff_id`, `start_time_of_day`, `end_time_of_day`, `peak_type`, `price`)
VALUES
-- '2020TimeOfUse1-6'
(1, '00:00:00', '05:59:59', 'offpeak', 0.345),
(1, '06:00:00', '07:59:59', 'midpeak', 0.708),
(1, '08:00:00', '10:59:59', 'onpeak', 1.159),
(1, '11:00:00', '17:59:59', 'midpeak', 0.708),
(1, '18:00:00', '20:59:59', 'onpeak', 1.159),
(1, '21:00:00', '21:59:59', 'midpeak', 0.708),
(1, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2020TimeOfUse7-9'
(2, '00:00:00', '05:59:59', 'offpeak', 0.345),
(2, '06:00:00', '07:59:59', 'midpeak', 0.708),
(2, '08:00:00', '10:59:59', 'offpeak', 1.159),
(2, '11:00:00', '12:59:59', 'midpeak', 0.708),
(2, '13:00:00', '14:59:59', 'onpeak', 1.159),
(2, '15:00:00', '17:59:59', 'midpeak', 0.708),
(2, '18:00:00', '20:59:59', 'onpeak', 1.159),
(2, '21:00:00', '21:59:59', 'midpeak', 0.708),
(2, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2020TimeOfUse10-12'
(3, '00:00:00', '05:59:59', 'offpeak', 0.345),
(3, '06:00:00', '07:59:59', 'midpeak', 0.708),
(3, '08:00:00', '10:59:59', 'onpeak', 1.159),
(3, '11:00:00', '17:59:59', 'midpeak', 0.708),
(3, '18:00:00', '20:59:59', 'onpeak', 1.159),
(3, '21:00:00', '21:59:59', 'midpeak', 0.708),
(3, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021TimeOfUse1-6'
(4, '00:00:00', '05:59:59', 'offpeak', 0.345),
(4, '06:00:00', '07:59:59', 'midpeak', 0.708),
(4, '08:00:00', '10:59:59', 'onpeak', 1.159),
(4, '11:00:00', '17:59:59', 'midpeak', 0.708),
(4, '18:00:00', '20:59:59', 'onpeak', 1.159),
(4, '21:00:00', '21:59:59', 'midpeak', 0.708),
(4, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021TimeOfUse7-9'
(5, '00:00:00', '05:59:59', 'offpeak', 0.345),
(5, '06:00:00', '07:59:59', 'midpeak', 0.708),
(5, '08:00:00', '10:59:59', 'offpeak', 1.159),
(5, '11:00:00', '12:59:59', 'midpeak', 0.708),
(5, '13:00:00', '14:59:59', 'onpeak', 1.159),
(5, '15:00:00', '17:59:59', 'midpeak', 0.708),
(5, '18:00:00', '20:59:59', 'onpeak', 1.159),
(5, '21:00:00', '21:59:59', 'midpeak', 0.708),
(5, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021TimeOfUse10-12'
(6, '00:00:00', '05:59:59', 'offpeak', 0.345),
(6, '06:00:00', '07:59:59', 'midpeak', 0.708),
(6, '08:00:00', '10:59:59', 'onpeak', 1.159),
(6, '11:00:00', '17:59:59', 'midpeak', 0.708),
(6, '18:00:00', '20:59:59', 'onpeak', 1.159),
(6, '21:00:00', '21:59:59', 'midpeak', 0.708),
(6, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022TimeOfUse1-6'
(7, '00:00:00', '05:59:59', 'offpeak', 0.345),
(7, '06:00:00', '07:59:59', 'midpeak', 0.708),
(7, '08:00:00', '10:59:59', 'onpeak', 1.159),
(7, '11:00:00', '17:59:59', 'midpeak', 0.708),
(7, '18:00:00', '20:59:59', 'onpeak', 1.159),
(7, '21:00:00', '21:59:59', 'midpeak', 0.708),
(7, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022TimeOfUse7-9'
(8, '00:00:00', '05:59:59', 'offpeak', 0.345),
(8, '06:00:00', '07:59:59', 'midpeak', 0.708),
(8, '08:00:00', '10:59:59', 'offpeak', 1.159),
(8, '11:00:00', '12:59:59', 'midpeak', 0.708),
(8, '13:00:00', '14:59:59', 'onpeak', 1.159),
(8, '15:00:00', '17:59:59', 'midpeak', 0.708),
(8, '18:00:00', '20:59:59', 'onpeak', 1.159),
(8, '21:00:00', '21:59:59', 'midpeak', 0.708),
(8, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022TimeOfUse10-12'
(9, '00:00:00', '05:59:59', 'offpeak', 0.345),
(9, '06:00:00', '07:59:59', 'midpeak', 0.708),
(9, '08:00:00', '10:59:59', 'onpeak', 1.159),
(9, '11:00:00', '17:59:59', 'midpeak', 0.708),
(9, '18:00:00', '20:59:59', 'onpeak', 1.159),
(9, '21:00:00', '21:59:59', 'midpeak', 0.708),
(9, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023TimeOfUse1-6'
(10, '00:00:00', '05:59:59', 'offpeak', 0.345),
(10, '06:00:00', '07:59:59', 'midpeak', 0.708),
(10, '08:00:00', '10:59:59', 'onpeak', 1.159),
(10, '11:00:00', '17:59:59', 'midpeak', 0.708),
(10, '18:00:00', '20:59:59', 'onpeak', 1.159),
(10, '21:00:00', '21:59:59', 'midpeak', 0.708),
(10, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023TimeOfUse7-9'
(11, '00:00:00', '05:59:59', 'offpeak', 0.345),
(11, '06:00:00', '07:59:59', 'midpeak', 0.708),
(11, '08:00:00', '10:59:59', 'offpeak', 1.159),
(11, '11:00:00', '12:59:59', 'midpeak', 0.708),
(11, '13:00:00', '14:59:59', 'onpeak', 1.159),
(11, '15:00:00', '17:59:59', 'midpeak', 0.708),
(11, '18:00:00', '20:59:59', 'onpeak', 1.159),
(11, '21:00:00', '21:59:59', 'midpeak', 0.708),
(11, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023TimeOfUse10-12'
(12, '00:00:00', '05:59:59', 'offpeak', 0.345),
(12, '06:00:00', '07:59:59', 'midpeak', 0.708),
(12, '08:00:00', '10:59:59', 'onpeak', 1.159),
(12, '11:00:00', '17:59:59', 'midpeak', 0.708),
(12, '18:00:00', '20:59:59', 'onpeak', 1.159),
(12, '21:00:00', '21:59:59', 'midpeak', 0.708),
(12, '22:00:00', '23:59:59', 'offpeak', 0.345),

-- 'Water'
(13, '00:00:00', '23:59:59', 'midpeak', 5.95),

-- 'Natural Gas'
(14, '00:00:00', '23:59:59', 'midpeak', 3.50);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_stores`
(`id`, `name`, `uuid`, `address`, `latitude`, `longitude`, `area`, `store_type_id`, `is_input_counted`, `contact_id`, `cost_center_id`, `description`)
VALUES
(1, '麦当劳', 'd8a24322-4bab-4ba2-aedc-5d55a84c3db8', '北京市东城区东打磨厂街7号', 39.899493, 116.412041, 500.000, 1, 1, 1, 1,  'MacDonalds');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_store_types`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_store_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, '餐饮', '494d7d5e-e139-4629-b957-99ea4caf0401', '餐饮', 'RS'),
(2, '零售', '1f556579-9d5c-45ce-9bd8-f2dc1d033470', '零售', 'RT'),
(3, '酒店', 'cae697aa-ceca-435d-91bf-492b46607eb0', '酒店', 'HT');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_stores_meters`
(`store_id`, `meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_stores_offline_meters`
(`store_id`, `offline_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_stores_points`
(`store_id`, `point_id`)
VALUES
(1, 1),
(1, 2),
(1, 3);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_stores_sensors`
(`store_id`, `sensor_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_stores_virtual_meters`
(`store_id`, `virtual_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tenants`
(`id`, `name`, `uuid`, `buildings`, `floors`, `rooms`, `area`, `tenant_type_id`, `is_input_counted`, `is_key_tenant`,
   `lease_number`, `lease_start_datetime_utc`, `lease_end_datetime_utc`, `is_in_lease`, `contact_id`, `cost_center_id`, `description`)
VALUES
(1, 'Starbucks星巴克', '6b0da806-a4cd-431a-8116-2915e90aaf8b', 'Building #1', 'L1 L2 L3', '1201b+2247+3F', 418.8, 9, 1, 1,
 '6b0da806',  '2019-12-31 16:00:00', '2022-12-31 16:00:00', 1, 1, 1,  'my description');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenant_types`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tenant_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, '餐饮租户', '83fffba1-9e22-4397-a93a-3742772c3753', 'Food and Beverage', 'FNB'),
(2, '燃气餐饮租户', 'ad95ed16-1c57-49a9-a85e-71e389393089', 'Food and Beverage (Gas)', 'FNBGas'),
(3, '电餐饮租户', '1dc21e83-4333-40f8-9e25-ea049becba37', 'Food and Beverage (Electrical)', 'FNBElec'),
(4, '高照度租户', '4208a60d-d8e6-4fe5-8cea-a55109e9b397', 'High Illuminance Tenant', 'HighIllu'),
(5, '主力租户', 'fc4ae534-544a-4a22-b83b-9f4aa99494aa', 'Anchor Tenant', 'ANCH'),
(6, '普通商业租户', '6d1dca30-1cbe-463d-8a78-cdd5e0f8ac8b', 'Normal Tenant', 'Normal'),
(7, '其他商业租户', '2078e1c0-3936-4ae7-9253-08e0aa1d84b6', 'Other Retail Tenants', 'Other'),
(8, '整层办公租户', 'b2a580a3-edc9-4838-ae1d-7b7265860a9a', 'Whole Floor Office Tenant', 'WhFlr'),
(9, '非整层办公租户', '55bbcba7-d8a0-44a0-9a9f-2f085e3cb044', 'None-Whole Floor Office Tenant', 'NonWhFlr');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tenants_meters`
(`tenant_id`, `meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tenants_offline_meters`
(`tenant_id`, `offline_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tenants_points`
(`tenant_id`, `point_id`)
VALUES
(1, 2000001),
(3, 2000002),
(3, 2000003),
(3, 2000006);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tenants_sensors`
(`tenant_id`, `sensor_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_tenants_virtual_meters`
(`tenant_id`, `virtual_meter_id`)
VALUES
(1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `myems_system_db`.`tbl_virtual_meters`
(`id`, `name`, `uuid`, `equation`, `energy_category_id`, `is_counted`, `cost_center_id`, `energy_item_id`, `description`)
VALUES
(1, '虚拟表1', '3fff2cfb-f755-44c8-a919-6135205a8573', 'x1+x2+x3', 1, 1, 1, 1, 'virtual description');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_variables`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;

-- meter_type = {'meter', 'virtual_meter', 'offline_meter'}
INSERT INTO `myems_system_db`.`tbl_variables`
(`name`, `virtual_meter_id`, `meter_type`, `meter_id`)
VALUES
('x1', 1, 'meter', 1),
('x2', 1, 'meter', 2),
('x3', 1, 'meter', 3);

COMMIT;

