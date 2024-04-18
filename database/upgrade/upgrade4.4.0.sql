-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.3.0 TO 4.4.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

DELETE FROM myems_system_db.tbl_menus WHERE id=1401;
INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
VALUES
(1401, 'Energy Storage Power Station List','/energystoragepowerstation/list', 1400, 1),
(1402,'Energy Storage Power Station Details','/energystoragepowerstation/details',1400,1),
(1403, 'Energy Storage Power Station Reporting','/energystoragepowerstation/reporting', 1400, 1),
(1404, 'Energy Storage Power Station Alarm','/energystoragepowerstation/alarm', 1400, 1),
(1405, 'Energy Storage Power Station Maintenance','/energystoragepowerstation/maintenance', 1400, 1);

-- add columns
ALTER TABLE `myems_fdd_db`.`tbl_web_messages` ADD `update_datetime_utc` DATETIME NULL AFTER `created_datetime_utc`;
ALTER TABLE `myems_fdd_db`.`tbl_web_messages` ADD `end_datetime_utc` DATETIME NULL AFTER `created_datetime_utc`;
ALTER TABLE `myems_fdd_db`.`tbl_web_messages` ADD `start_datetime_utc` DATETIME NULL AFTER `created_datetime_utc`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations` ADD `is_cost_data_displayed` BOOL NOT NULL AFTER `svg`;
ALTER TABLE `myems_system_db`.`tbl_microgrids` ADD `is_cost_data_displayed` BOOL NOT NULL AFTER `svg`;

-- Create Energy Plan Database
CREATE DATABASE IF NOT EXISTS `myems_energy_plan_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
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

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meter_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_meter_hourly`
 (`meter_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_offline_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `offline_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meter_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_offline_meter_hourly` (`offline_meter_id`, `start_datetime_utc`);

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

CREATE TABLE IF NOT EXISTS `myems_energy_plan_db`.`tbl_virtual_meter_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_meter_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meter_hourly_index_1`
 ON `myems_energy_plan_db`.`tbl_virtual_meter_hourly` (`virtual_meter_id`, `start_datetime_utc`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.4.0', release_date='2024-04-17' WHERE id=1;

COMMIT;
