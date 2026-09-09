-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.8.0升级到6.9.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.8.0 TO 6.9.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_tariffs_timeofuses`
MODIFY COLUMN `price` DECIMAL(23, 8) NOT NULL;


-- myems_billing_db
ALTER TABLE `myems_billing_db`.`tbl_combined_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_combined_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_combined_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_charge_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_discharge_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_grid_buy_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_grid_sell_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_load_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_charge_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_discharge_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_load_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_meter_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_charge_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_discharge_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_evcharger_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_grid_buy_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_grid_sell_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_load_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_photovoltaic_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_offline_meter_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_generation_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_load_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_shopfloor_input_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_shopfloor_input_item_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_space_input_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_space_input_item_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_space_output_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_store_input_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_store_input_item_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_tenant_input_category_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_tenant_input_item_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_virtual_meter_hourly`
MODIFY COLUMN `actual_value` DECIMAL(23, 8) NOT NULL;

-- Add `is_enabled` flag to meters, virtual meters and offline meters.
-- Defaults to 1 (enabled) so existing meters keep their previous behaviour.
ALTER TABLE `myems_system_db`.`tbl_meters`
ADD COLUMN `is_enabled` BOOL NOT NULL DEFAULT 1 AFTER `is_counted`;

ALTER TABLE `myems_system_db`.`tbl_offline_meters`
ADD COLUMN `is_enabled` BOOL NOT NULL DEFAULT 1 AFTER `is_counted`;

ALTER TABLE `myems_system_db`.`tbl_virtual_meters`
ADD COLUMN `is_enabled` BOOL NOT NULL DEFAULT 1 AFTER `is_counted`;

UPDATE `myems_system_db`.`tbl_versions` SET version='6.9.0RC', release_date='2026-09-26' WHERE id=1;

COMMIT;