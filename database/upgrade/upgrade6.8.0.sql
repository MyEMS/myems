-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.7.0RC升级到6.8.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.7.0RC TO 6.8.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- Insert Dashboard menu item for Space Data (ID: 117, parent: 100)
INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES (117,'Dashboard','/space',100,0);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='6.8.0', release_date='2026-07-23' WHERE id=1;

COMMIT;
