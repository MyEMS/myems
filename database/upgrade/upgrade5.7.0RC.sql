-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.6.0升级到5.7.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.6.0 TO 5.7.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `data_source_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_data_sources_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_data_sources` (`energy_storage_container_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.7.0RC', release_date='2025-07-21' WHERE id=1;

COMMIT;