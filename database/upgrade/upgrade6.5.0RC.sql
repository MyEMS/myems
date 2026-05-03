-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.4.0升级到6.5.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.4.0 TO 6.5.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(329,'Offline Meter Prediction','/meter/offlinemeterprediction',300,1);

UPDATE `myems_system_db`.`tbl_menus` SET `route` = '/meter/virtualmeterprediction' WHERE `id` = 328

UPDATE `myems_system_db`.`tbl_versions` SET version='6.5.0RC', release_date='2026-05-26' WHERE id=1;

COMMIT;