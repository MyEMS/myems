-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.5.0升级到6.6.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.5.0 TO 6.6.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

UPDATE `myems_system_db`.`tbl_versions`
SET version='6.6.0', release_date='2026-06-26' WHERE id=1;

COMMIT;