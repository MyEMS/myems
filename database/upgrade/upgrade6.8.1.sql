-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.8.0升级到6.8.1
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.8.0 TO 6.8.1
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- Add `is_enabled` flag to meters, virtual meters and offline meters.
-- Defaults to 1 (enabled) so existing meters keep their previous behaviour.
ALTER TABLE `myems_system_db`.`tbl_meters`
ADD COLUMN `is_enabled` BOOL NOT NULL DEFAULT 1 AFTER `is_counted`;

ALTER TABLE `myems_system_db`.`tbl_offline_meters`
ADD COLUMN `is_enabled` BOOL NOT NULL DEFAULT 1 AFTER `is_counted`;

ALTER TABLE `myems_system_db`.`tbl_virtual_meters`
ADD COLUMN `is_enabled` BOOL NOT NULL DEFAULT 1 AFTER `is_counted`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='6.8.1', release_date='2026-09-06' WHERE id=1;

COMMIT;
