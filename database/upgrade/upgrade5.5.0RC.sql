-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.4.0升级到5.5.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.4.0 TO 5.5.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;


ALTER TABLE `myems_system_db`.`tbl_points`
ADD `definitions` LONGTEXT COMMENT 'Definitions MUST be in JSON format';


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.5.0', release_date='2025-05-25' WHERE id=1;

COMMIT;