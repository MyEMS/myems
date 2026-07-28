-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.7.0升级到6.8.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.7.0 TO 6.8.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES (330,'Dashboard','/meter',300,0);

UPDATE `myems_system_db`.`tbl_versions` SET version='6.8.0RC', release_date='2026-08-26' WHERE id=1;

COMMIT;