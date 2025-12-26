-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.11.0升级到5.12.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.11.0 TO 5.12.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE INDEX idx_menus_hidden_parent ON myems_system_db.tbl_menus (is_hidden, parent_menu_id);
CREATE INDEX idx_menus_is_hidden ON myems_system_db.tbl_menus (is_hidden);
CREATE INDEX idx_menus_parent_id ON myems_system_db.tbl_menus (parent_menu_id);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.12.0', release_date='2025-12-26' WHERE id=1;

COMMIT;