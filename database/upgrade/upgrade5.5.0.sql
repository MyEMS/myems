-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.4.0升级到5.5.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.4.0 TO 5.5.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;


ALTER TABLE `myems_system_db`.`tbl_points`
ADD `definitions` LONGTEXT COMMENT 'Definitions MUST be in JSON format';

DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations`;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_bmses`;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_bmses_points` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_cms` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_cms_points` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_commands` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_generators` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_generators_points` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_loads` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_loads_points` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_mcus` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_mcus_points` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pcses` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pcses_points` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pvs` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pvs_points` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_hybrid_power_stations_users` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_hybrid_power_stations` ;
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_hybrid_power_station_charge_hourly` ;
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_hybrid_power_station_discharge_hourly` ;
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_hybrid_power_station_fuel_hourly` ;
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_hybrid_power_station_grid_buy_hourly` ;
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_hybrid_power_station_grid_sell_hourly` ;
DROP TABLE IF EXISTS `myems_billing_db`.`tbl_hybrid_power_station_load_hourly` ;
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_charge_hourly` ;
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_discharge_hourly` ;
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_fuel_hourly` ;
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_grid_buy_hourly` ;
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_grid_sell_hourly` ;
DROP TABLE IF EXISTS `myems_carbon_db`.`tbl_hybrid_power_station_load_hourly` ;
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_hybrid_power_station_charge_hourly` ;
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_hybrid_power_station_discharge_hourly` ;
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_hybrid_power_station_fuel_hourly` ;
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_hybrid_power_station_grid_buy_hourly` ;
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_hybrid_power_station_grid_sell_hourly` ;
DROP TABLE IF EXISTS `myems_energy_db`.`tbl_hybrid_power_station_load_hourly` ;
DROP TABLE IF EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_charge_hourly` ;
DROP TABLE IF EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_discharge_hourly` ;
DROP TABLE IF EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_fuel_hourly` ;
DROP TABLE IF EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_grid_buy_hourly` ;
DROP TABLE IF EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_grid_sell_hourly` ;
DROP TABLE IF EXISTS `myems_energy_prediction_db`.`tbl_hybrid_power_station_load_hourly` ;



-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.5.0', release_date='2025-05-29' WHERE id=1;

COMMIT;