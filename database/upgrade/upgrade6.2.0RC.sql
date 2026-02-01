-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.1.0升级到6.2.0RC
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.1.0 TO 6.2.0RC
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_system_db`.`tbl_equipments`
ADD `efficiency_indicator` DECIMAL(21, 6) DEFAULT 0.000000 NOT NULL AFTER cost_center_id;

UPDATE `myems_system_db`.`tbl_versions` SET version='6.2.0RC', release_date='2026-02-28' WHERE id=1;

COMMIT;