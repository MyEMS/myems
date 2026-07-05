-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.6.0升级到6.7.0RC
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.6.0 TO 6.7.0RC
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

UPDATE `myems_system_db`.`tbl_versions`
SET version='6.7.0RC', release_date='2026-07-26' WHERE id=1;

COMMIT;