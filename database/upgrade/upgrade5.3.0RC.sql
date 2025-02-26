-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.2.0升级到5.3.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.2.0 TO 5.3.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_bmses_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_bmses_points` (`bms_id`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.3.0RC', release_date='2025-03-15' WHERE id=1;

COMMIT;