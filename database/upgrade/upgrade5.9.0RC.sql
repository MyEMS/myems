-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.8.0升级到5.9.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.8.0 TO 5.9.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES (214,'Equipment Comparison','/equipment/comparison',200,0);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_iot_sim_cards` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `iccid` VARCHAR(255) NOT NULL,
  `imsi` VARCHAR(255),
  `operator` VARCHAR(255),
  `status` VARCHAR(255),
  `active_time` VARCHAR(255),
  `open_time` VARCHAR(255),
  `expiration_time` VARCHAR(255),
  `used_traffic` DECIMAL(21, 6),
  `total_traffic` DECIMAL(21, 6),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_iot_sim_cards_index_1` ON `myems_system_db`.`tbl_iot_sim_cards` (`iccid`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.9.0RC', release_date='2025-09-28' WHERE id=1;

COMMIT;