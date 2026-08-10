-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.6.0升级到6.7.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.6.0 TO 6.7.0
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

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES (117,'Dashboard','/space',100,0);

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES (330,'Dashboard','/meter',300,0);

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
  DROP COLUMN `factor_type`,
  DROP COLUMN `factor`;

UPDATE `myems_system_db`.`tbl_versions`

SET version='6.7.0', release_date='2026-07-26' WHERE id=1;

COMMIT;