-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.3.4 TO 1.4.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

-- NOTE: BACKUP YOUR DATABASE AND SOURCE CODE FIRST
-- THIS UPGRADE MAY CAUSE DATA LOSS AND BREAK YOUR MYEMS SYSTEM

-- THIS UPGRADE SCRIPT WILL MERGE EXPRESSION TABLE INTO VIRTUAL METER TABLE
-- STOP NORMALIZATION SERVICE BEFORE RUNNING THIS SCRIPT:
-- $ sudo systemctl stop myems-normalization.service
-- AFTER RUNNING THIS UPGRADE SCRIPT,
-- UPGRADE ADMIN UI, API, AND NORMALIZATION SERVICE
-- START NORMALIZATION SERVICE
-- $ sudo systemctl start myems-normalization.service
START TRANSACTION;
CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_meters_new` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `equation` LONGTEXT NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_variables_new` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` CHAR(36) NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `meter_type` VARCHAR(32) NOT NULL COMMENT 'meter, virtual_meter, offline_meter',
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO myems_system_db.tbl_virtual_meters_new
(id, name, uuid, equation, energy_category_id, is_counted, cost_center_id, energy_item_id, description)
SELECT tvm.id, tvm.name, tvm.uuid, te.equation, tvm.energy_category_id, tvm.is_counted, tvm.cost_center_id,
       tvm.energy_item_id, tvm.description
FROM myems_system_db.tbl_virtual_meters tvm, myems_system_db.tbl_expressions te
WHERE tvm.id = te.virtual_meter_id ;

INSERT INTO myems_system_db.tbl_variables_new
(id, name, virtual_meter_id, meter_type, meter_id)
SELECT tv.id, tv.name, te.virtual_meter_id, tv.meter_type, tv.meter_id
FROM myems_system_db.tbl_variables tv, myems_system_db.tbl_expressions te
WHERE tv.expression_id = te.id ;

DROP TABLE IF EXISTS myems_system_db.tbl_variables;
DROP TABLE IF EXISTS myems_system_db.tbl_virtual_meters;

ALTER TABLE myems_system_db.tbl_variables_new RENAME myems_system_db.tbl_variables;
ALTER TABLE myems_system_db.tbl_virtual_meters_new RENAME myems_system_db.tbl_virtual_meters;

CREATE INDEX `tbl_variables_index_1` ON `myems_system_db`.`tbl_variables` (`virtual_meter_id`);
CREATE INDEX `tbl_variables_index_2` ON `myems_system_db`.`tbl_variables` (`meter_id`, `meter_type`, `virtual_meter_id`);
CREATE INDEX `tbl_virtual_meters_index_1` ON `myems_system_db`.`tbl_virtual_meters` (`name`);
CREATE INDEX `tbl_virtual_meters_index_2` ON `myems_system_db`.`tbl_virtual_meters` (`energy_category_id`);
CREATE INDEX `tbl_virtual_meters_index_3` ON `myems_system_db`.`tbl_virtual_meters` (`energy_item_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.4.0', release_date='2021-11-14' WHERE id=1;

COMMIT;
