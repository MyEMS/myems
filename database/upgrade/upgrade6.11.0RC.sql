-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将6.10.0升级到6.11.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 6.10.0 TO 6.11.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_work_orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `number` VARCHAR(32) NOT NULL,
  `category` VARCHAR(32) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `priority` VARCHAR(32) NOT NULL,
  `status` VARCHAR(32) NOT NULL,
  `belong_to_object_type` VARCHAR(128) NULL
  COMMENT 'SYSTEM, SPACE, METER, TENANT, STORE, SHOPFLOOR, EQUIPMENT, COMBINEDEQUIPMENT, MICROGRID, ENERGYSTORAGECONTAINER, PHOTOVOLTAICPOWERSTATION',
  `belong_to_object_id` BIGINT NULL,
  `source_type` VARCHAR(32) NOT NULL DEFAULT 'manual',
  `source_id` BIGINT NULL,
  `creator_user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  `assignee_user_id` BIGINT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  `scheduled_start_datetime_utc` DATETIME NULL,
  `due_datetime_utc` DATETIME NULL,
  `started_datetime_utc` DATETIME NULL,
  `finished_datetime_utc` DATETIME NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `update_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE UNIQUE INDEX `tbl_work_orders_index_1` ON `myems_system_db`.`tbl_work_orders` (`number`);
CREATE INDEX `tbl_work_orders_index_2`
ON `myems_system_db`.`tbl_work_orders` (`category`, `created_datetime_utc`);
CREATE INDEX `tbl_work_orders_index_3` ON `myems_system_db`.`tbl_work_orders` (`status`);
CREATE INDEX `tbl_work_orders_index_4` ON `myems_system_db`.`tbl_work_orders` (`assignee_user_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_work_order_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `work_order_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  `action` VARCHAR(32) NOT NULL,
  `from_status` VARCHAR(32) NULL,
  `to_status` VARCHAR(32) NOT NULL,
  `comment` LONGTEXT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_work_order_logs_index_1` ON `myems_system_db`.`tbl_work_order_logs` (`work_order_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_work_order_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `work_order_id` BIGINT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `uploaded_by_user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  `created_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_work_order_files_index_1` ON `myems_system_db`.`tbl_work_order_files` (`work_order_id`);

INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
SELECT 1300, 'Work Order', '/workorder', NULL, 0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM myems_system_db.tbl_menus WHERE id = 1300);

INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
SELECT 1301, 'Work Order Repair', '/workorder/repair', 1300, 0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM myems_system_db.tbl_menus WHERE id = 1301);

INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
SELECT 1302, 'Work Order Inspection', '/workorder/inspection', 1300, 0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM myems_system_db.tbl_menus WHERE id = 1302);

INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
SELECT 1303, 'Work Order Installation', '/workorder/installation', 1300, 0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM myems_system_db.tbl_menus WHERE id = 1303);

UPDATE `myems_system_db`.`tbl_versions` SET version='6.11.0RC', release_date='2026-11-07' WHERE id=1;

COMMIT;
