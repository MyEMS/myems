-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.6.0 TO 4.7.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_svgs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `source_code` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_svgs_index_1` ON `myems_system_db`.`tbl_svgs` (`name`);

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_combined_equipments ADD `svg_id` BIGINT AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_combined_equipments DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_distribution_systems ADD `svg_id` BIGINT NOT NULL AFTER `uuid`;
ALTER TABLE myems_system_db.tbl_distribution_systems DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_energy_storage_containers ADD `svg_id` BIGINT AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_energy_storage_containers DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_energy_storage_power_stations ADD `svg_id` BIGINT NOT NULL AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_energy_storage_power_stations DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_equipments ADD `svg_id` BIGINT AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_equipments DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations ADD `svg_id` BIGINT NOT NULL AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_microgrids ADD `svg_id` BIGINT NOT NULL AFTER `serial_number`;
ALTER TABLE myems_system_db.tbl_microgrids DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_virtual_power_plants ADD `svg_id` BIGINT NOT NULL AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_virtual_power_plants DROP COLUMN svg;

-- WARNING: THIS ACTION WILL DELETE SVG SOURCE CODE, SAVE SVG SOURCE CODE TO tbl_svgs OR A TEXT FILE FIRST
ALTER TABLE myems_system_db.tbl_wind_farms ADD `svg_id` BIGINT NOT NULL AFTER `cost_center_id`;
ALTER TABLE myems_system_db.tbl_wind_farms DROP COLUMN svg;

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(40000,'Work Order','/workorder',NULL,1),
(40001,'Work Order Installation','/workorder/installation',40000,1),
(40002,'Work Order Repair','/workorder/repair',40000,1),
(40003,'Work Order Inspection','/workorder/inspection',40000,1);


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_protocols` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_protocols_index_1` ON `myems_system_db`.`tbl_protocols` (`name`);

INSERT INTO myems_system_db.tbl_protocols (id,name,code)
VALUES
(1,'bacnet-ip', 'bacnet-ip'),
(2,'cassandra', 'cassandra'),
(3,'clickhouse', 'clickhouse'),
(4,'coap', 'coap'),
(5,'controllogix', 'controllogix'),
(6,'dlt645', 'dlt645'),
(7,'dtu-rtu', 'dtu-rtu'),
(8,'dtu-tcp', 'dtu-tcp'),
(9,'dtu-mqtt', 'dtu-mqtt'),
(10,'elexon-bmrs', 'elexon-bmrs'),
(11,'iec104', 'iec104'),
(12,'influxdb', 'influxdb'),
(13,'lora', 'lora'),
(14,'modbus-rtu', 'modbus-rtu'),
(15,'modbus-tcp', 'modbus-tcp'),
(16,'mongodb', 'mongodb'),
(17,'mqtt-acrel', 'mqtt-acrel'),
(18,'mqtt-adw300', 'mqtt-adw300'),
(19,'mqtt-huiju', 'mqtt-huiju'),
(20,'mqtt-md4220', 'mqtt-md4220'),
(21,'mqtt-seg', 'mqtt-seg'),
(22,'mqtt-weilan', 'mqtt-weilan'),
(23,'mqtt-xintianli', 'mqtt-xintianli'),
(24,'mqtt-zhongxian', 'mqtt-zhongxian'),
(25,'mqtt', 'mqtt'),
(26,'mysql', 'mysql'),
(27,'opc-ua', 'opc-ua'),
(28,'oracle', 'oracle'),
(29,'postgresql', 'postgresql'),
(30,'profibus', 'profibus'),
(31,'profinet', 'profinet'),
(32,'s7', 's7'),
(33,'simulation', 'simulation'),
(34,'sqlserver', 'sqlserver'),
(35,'tdengine', 'tdengine'),
(36,'weather', 'weather');

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.7.0RC', release_date='2024-07-07' WHERE id=1;

COMMIT;

