-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将4.12.0升级到5.1.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.12.0 TO 5.1.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- upgrade myems_system_db
ALTER TABLE `myems_system_db`.`tbl_points`
ADD `faults` LONGTEXT COMMENT 'Faults MUST be in JSON format';

ALTER TABLE `myems_system_db`.`tbl_charging_stations`
MODIFY COLUMN `rated_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_commands`
MODIFY COLUMN `set_value` DECIMAL(21, 6) NULL DEFAULT NULL COMMENT 'If not null, the $s1 in payload will be replaced with this value';
ALTER TABLE `myems_system_db`.`tbl_distribution_circuits`
MODIFY COLUMN `peak_load` DECIMAL(21, 6) NULL DEFAULT NULL COMMENT '最大容量, 设备容量(KW)',
MODIFY COLUMN `peak_current` DECIMAL(21, 6) NULL DEFAULT NULL COMMENT '最大电流, 计算电流(A)';
ALTER TABLE `myems_system_db`.`tbl_energy_categories`
MODIFY COLUMN `kgce` DECIMAL(21, 6) NOT NULL COMMENT 'Kilogram of Coal Equivalent',
MODIFY COLUMN `kgco2e` DECIMAL(21, 6) NOT NULL COMMENT 'Carbon Dioxide Emissions Factor';
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers`
MODIFY COLUMN `rated_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_batteries`
MODIFY COLUMN `rated_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `nominal_voltage` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_grids`
MODIFY COLUMN `capacity` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_loads`
MODIFY COLUMN `rated_input_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
MODIFY COLUMN `rated_output_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_schedules`
MODIFY COLUMN `power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
MODIFY COLUMN `rated_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_integrators`
MODIFY COLUMN `heat_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `liquid_density` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `coefficient` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_meters`
MODIFY COLUMN `hourly_low_limit` DECIMAL(21, 6) NOT NULL COMMENT 'Inclusive. The efault is 0. If the meter has accuracy problems, set the value to a small positive value, such as 0.100',
MODIFY COLUMN `hourly_high_limit` DECIMAL(21, 6) NOT NULL COMMENT 'Inclusive. Maximum energy consumption per hour, Rated total active Power, Rated Flow, etc.';
ALTER TABLE `myems_system_db`.`tbl_microgrids`
MODIFY COLUMN `rated_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_batteries`
MODIFY COLUMN `rated_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `nominal_voltage` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_power_conversion_systems`
MODIFY COLUMN `rated_output_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_evchargers`
MODIFY COLUMN `rated_output_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_generators`
MODIFY COLUMN `rated_output_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_grids`
MODIFY COLUMN `capacity` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_heatpumps`
MODIFY COLUMN `rated_input_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_loads`
MODIFY COLUMN `rated_input_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_photovoltaics`
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_microgrids_schedules`
MODIFY COLUMN `power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_offline_meters`
MODIFY COLUMN `hourly_low_limit` DECIMAL(21, 6) NOT NULL COMMENT 'Inclusive. Default is 0.',
MODIFY COLUMN `hourly_high_limit` DECIMAL(21, 6) NOT NULL COMMENT 'Inclusive. Maximum energy consumption per hour.';
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
MODIFY COLUMN `rated_capacity` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations_grids`
MODIFY COLUMN `capacity` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations_loads`
MODIFY COLUMN `rated_input_power` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_points`
MODIFY COLUMN `high_limit` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `low_limit` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `higher_limit` DECIMAL(21, 6) NULL DEFAULT NULL COMMENT 'Used in FDD Service',
MODIFY COLUMN `lower_limit` DECIMAL(21, 6) NULL DEFAULT NULL COMMENT 'Used in FDD Service',
MODIFY COLUMN `ratio` DECIMAL(21, 6) NOT NULL DEFAULT 1.000000,
MODIFY COLUMN `offset_constant` DECIMAL(21, 6) NOT NULL DEFAULT 0.000000;
ALTER TABLE `myems_system_db`.`tbl_shopfloors`
MODIFY COLUMN `area` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_spaces`
MODIFY COLUMN `area` DECIMAL(21, 6) NOT NULL,
MODIFY COLUMN `number_of_occupants` DECIMAL(21, 6) NOT NULL DEFAULT 1.000;
ALTER TABLE `myems_system_db`.`tbl_tariffs_timeofuses`
MODIFY COLUMN `price` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_stores`
MODIFY COLUMN `area` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_tenants`
MODIFY COLUMN `area` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
MODIFY COLUMN `rated_power` DECIMAL(21, 6) NOT NULL;

-- myems_billing_db
ALTER TABLE `myems_billing_db`.`tbl_combined_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_combined_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_combined_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_container_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_energy_storage_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_evcharger_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_microgrid_photovoltaic_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_offline_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_generation_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_photovoltaic_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_shopfloor_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_shopfloor_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_space_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_space_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_space_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_store_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_store_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_tenant_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_tenant_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_billing_db`.`tbl_virtual_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;

-- upgrade myems_carbon_db
ALTER TABLE `myems_carbon_db`.`tbl_combined_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_combined_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_combined_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_container_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_container_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_container_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_container_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_container_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_power_station_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_power_station_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_energy_storage_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_microgrid_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_microgrid_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_microgrid_evcharger_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_microgrid_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_microgrid_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_microgrid_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_microgrid_photovoltaic_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_offline_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_photovoltaic_power_station_generation_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_photovoltaic_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_shopfloor_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_shopfloor_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_space_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_space_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_space_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_store_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_store_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_tenant_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_tenant_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_carbon_db`.`tbl_virtual_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;

-- myems_energy_baseline_db
ALTER TABLE `myems_energy_baseline_db`.`tbl_combined_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_combined_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_combined_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_container_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_container_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_container_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_container_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_container_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_power_station_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_power_station_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_energy_storage_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_microgrid_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_microgrid_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_microgrid_evcharger_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_microgrid_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_microgrid_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_microgrid_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_microgrid_photovoltaic_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_offline_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_generation_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_photovoltaic_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_shopfloor_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_shopfloor_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_space_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_space_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_space_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_store_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_store_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_tenant_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_tenant_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_baseline_db`.`tbl_virtual_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;

-- upgrade myems_energy_db
ALTER TABLE `myems_energy_db`.`tbl_combined_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_combined_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_combined_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_container_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_container_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_container_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_container_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_container_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_power_station_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_power_station_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_energy_storage_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_microgrid_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_microgrid_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_microgrid_evcharger_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_microgrid_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_microgrid_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_microgrid_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_microgrid_photovoltaic_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_offline_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_photovoltaic_power_station_generation_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_photovoltaic_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_shopfloor_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_shopfloor_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_space_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_space_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_space_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_store_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_store_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_tenant_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_tenant_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_db`.`tbl_virtual_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;

-- upgrade myems_energy_model_db
ALTER TABLE `myems_energy_model_db`.`tbl_combined_equipment_input_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_combined_equipment_input_item_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_combined_equipment_output_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_container_charge_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_container_discharge_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_container_grid_buy_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_container_grid_sell_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_container_load_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_power_station_charge_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_power_station_discharge_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_power_station_grid_buy_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_power_station_grid_sell_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_energy_storage_power_station_load_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_equipment_input_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_equipment_input_item_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_equipment_output_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_meter_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_microgrid_charge_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_microgrid_discharge_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_microgrid_evcharger_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_microgrid_grid_buy_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_microgrid_grid_sell_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_microgrid_load_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_microgrid_photovoltaic_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_offline_meter_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_photovoltaic_power_station_generation_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_photovoltaic_power_station_grid_buy_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_photovoltaic_power_station_grid_sell_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_photovoltaic_power_station_load_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_shopfloor_input_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_shopfloor_input_item_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_space_input_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_space_input_item_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_space_output_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_store_input_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_store_input_item_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_tenant_input_category_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_tenant_input_item_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_model_db`.`tbl_virtual_meter_8760`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;

-- upgrade myems_energy_plan_db
ALTER TABLE `myems_energy_plan_db`.`tbl_combined_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_combined_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_combined_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_container_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_container_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_container_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_container_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_container_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_power_station_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_power_station_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_energy_storage_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_microgrid_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_microgrid_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_microgrid_evcharger_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_microgrid_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_microgrid_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_microgrid_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_microgrid_photovoltaic_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_offline_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_photovoltaic_power_station_generation_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_photovoltaic_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_shopfloor_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_shopfloor_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_space_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_space_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_space_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_store_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_store_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_tenant_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_tenant_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_plan_db`.`tbl_virtual_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;

-- upgrade myems_energy_prediction_db
ALTER TABLE `myems_energy_prediction_db`.`tbl_combined_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_combined_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_combined_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_container_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_container_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_container_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_container_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_container_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_power_station_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_power_station_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_energy_storage_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_equipment_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_equipment_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_equipment_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_microgrid_charge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_microgrid_discharge_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_microgrid_evcharger_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_microgrid_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_microgrid_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_microgrid_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_microgrid_photovoltaic_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_offline_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_generation_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_grid_buy_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_grid_sell_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_photovoltaic_power_station_load_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_shopfloor_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_shopfloor_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_space_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_space_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_space_output_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_store_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_store_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_tenant_input_category_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_tenant_input_item_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_energy_prediction_db`.`tbl_virtual_meter_hourly`
MODIFY COLUMN `actual_value` decimal(21, 6) NOT NULL;

-- upgrade myems_historical_db
ALTER TABLE `myems_historical_db`.`tbl_analog_value`
MODIFY COLUMN `actual_value` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_historical_db`.`tbl_analog_value_latest`
MODIFY COLUMN `actual_value` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_historical_db`.`tbl_energy_value`
MODIFY COLUMN `actual_value` DECIMAL(21, 6) NOT NULL;
ALTER TABLE `myems_historical_db`.`tbl_energy_value_latest`
MODIFY COLUMN `actual_value` DECIMAL(21, 6) NOT NULL;

-- upgrade myems_production_db
ALTER TABLE `myems_production_db`.`tbl_products`
MODIFY COLUMN `standard_product_coefficient` decimal(21, 6) NOT NULL DEFAULT 1.000000;
ALTER TABLE `myems_production_db`.`tbl_shopfloor_hourly`
MODIFY COLUMN `product_count` decimal(21, 6) NOT NULL;
ALTER TABLE `myems_production_db`.`tbl_space_hourly`
MODIFY COLUMN `product_count` decimal(21, 6) NOT NULL;

-- upgraded myems_system_db.tbl_energy_storage_containers_firecontrols
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `ac_relay_tripping_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `fault_light_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `running_light_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `second_level_fire_alarm_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `first_level_fire_alarm_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `electrical_compartment_door_open_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `battery_compartment_door_open_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `electrical_compartment_smoke_detector_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `emergency_stop_point_id` BIGINT AFTER `energy_storage_container_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
ADD COLUMN `water_immersion_point_id` BIGINT AFTER `energy_storage_container_id`;


-- upgraded myems_system_db.tbl_energy_storage_containers_hvacs
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
ADD COLUMN `humidity_inside_point_id` BIGINT AFTER `temperature_inside_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
ADD COLUMN `defrosting_temperature_point_id` BIGINT AFTER `condensation_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
ADD COLUMN `heating_control_hysteresis_point_id` BIGINT AFTER `heating_off_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
ADD COLUMN `cooling_control_hysteresis_point_id` BIGINT AFTER `cooling_off_temperature_point_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_hvacs`
ADD COLUMN `high_humidity_alarm_set_point_id` BIGINT AFTER `low_temperature_alarm_set_point_id`;


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.1.0RC', release_date='2025-01-15' WHERE id=1;

COMMIT;