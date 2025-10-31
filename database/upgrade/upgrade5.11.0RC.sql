-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.10.0升级到5.11.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.10.0 TO 5.11.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(325, 'Virtual Meter Comparison', '/meter/virtualmetercomparison', 300, 0),
(326, 'Power Qulity', '/meter/powerqulity', 300, 0),
(510, 'Store Comparison', '/store/comparison', 500, 0);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.11.0RC', release_date='2025-11-28' WHERE id=1;

COMMIT;