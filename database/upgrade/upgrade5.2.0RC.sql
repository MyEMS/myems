-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.1.0升级到5.2.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.1.0 TO 5.2.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;


ALTER TABLE `myems_historical_db`.`tbl_text_value_latest`
RENAME INDEX `tbl_energy_value_latest_index_1` TO `tbl_text_value_latest_index_1`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.2.0RC', release_date='2025-02-15' WHERE id=1;

COMMIT;