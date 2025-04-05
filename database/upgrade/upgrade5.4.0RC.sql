-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.3.0升级到5.4.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.3.0 TO 5.4.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_charging_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_hybrid_power_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
DROP COLUMN `postal_code`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
DROP COLUMN `postal_code`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.4.0RC', release_date='2025-04-25' WHERE id=1;

COMMIT;