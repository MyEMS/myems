-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.6.0升级到5.7.1
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.6.0 TO 5.7.1
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_points_set_values` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `set_value` DECIMAL(21, 6) NOT NULL,
  `is_set` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_points_set_values_index_1` ON `myems_system_db`.`tbl_points_set_values` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_points_set_values_index_2` ON `myems_system_db`.`tbl_points_set_values` (`utc_date_time`);


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_invertors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `invertor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_invertors_points_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_invertors_points` (`invertor_id`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.8.0RC', release_date='2025-08-28' WHERE id=1;

COMMIT;