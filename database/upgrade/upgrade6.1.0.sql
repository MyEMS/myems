-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.12.0升级到6.1.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.12.0 TO 6.1.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE `myems_user_db`.`tbl_users`
ADD COLUMN `phone` VARCHAR(20) NULL UNIQUE AFTER `email`;

UPDATE `myems_system_db`.`tbl_versions` SET version='6.1.0', release_date='2026-01-28' WHERE id=1;

COMMIT;