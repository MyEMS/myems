-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.2.0升级到6.3.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.2.0 TO 6.3.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- 本次升级数据库结构没有实质性变化
-- There are no substantial changes to the database structure in this upgrade.

UPDATE `myems_system_db`.`tbl_versions` SET version='6.3.0', release_date='2026-03-28' WHERE id=1;

COMMIT;