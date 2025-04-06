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

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_control_modes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `is_active` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_control_modes_index_1` ON `myems_system_db`.`tbl_control_modes` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_control_modes_times` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `control_mode_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `power_value` DECIMAL(21, 6),
  `power_point_id` BIGINT,
  `power_equation` LONGTEXT COMMENT 'MUST be in json format or NULL',
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_control_modes_times_index_1` ON `myems_system_db`.`tbl_control_modes_times` (`control_mode_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.4.0RC', release_date='2025-04-25' WHERE id=1;

COMMIT;