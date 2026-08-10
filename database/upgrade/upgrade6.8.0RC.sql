-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.7.0升级到6.8.0RC
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.7.0 TO 6.8.0RC
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_equipment_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_count` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_hourly_index_1`
ON `myems_production_db`.`tbl_equipment_hourly` (`equipment_id`, `product_id`, `start_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Ensure `tbl_emission_factors_timeofuses` exists (for upgrades from versions before this table was introduced)
-- ---------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_emission_factors_timeofuses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `emission_factor_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `factor` DECIMAL(21, 6) NOT NULL COMMENT 'CO2 emission factor in this time period, e.g. kgCO2/kWh',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_emission_factors_timeofuses_index_1`
ON `myems_system_db`.`tbl_emission_factors_timeofuses` (`emission_factor_id`, `start_time_of_day`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Emission Factor simplification: remove fixed/timeofuse distinction.
-- A 'fixed' factor is now represented as a single time-of-use period covering 00:00:00-24:00:00.
-- ---------------------------------------------------------------------------------------------------------------------
-- Migrate existing 'fixed' factors into a full-day time-of-use period
INSERT INTO `myems_system_db`.`tbl_emission_factors_timeofuses`
  (`emission_factor_id`, `start_time_of_day`, `end_time_of_day`, `factor`)
SELECT `id`, '00:00:00', '24:00:00', `factor`
FROM `myems_system_db`.`tbl_emission_factors`
WHERE `factor_type` = 'fixed' AND `factor` IS NOT NULL;

-- Drop the now-unused columns
ALTER TABLE `myems_system_db`.`tbl_emission_factors`
  DROP COLUMN IF EXISTS `factor_type`,
  DROP COLUMN IF EXISTS `factor`;

UPDATE `myems_system_db`.`tbl_versions`

SET version='6.8.0RC', release_date='2026-08-10' WHERE id=1;

COMMIT;
