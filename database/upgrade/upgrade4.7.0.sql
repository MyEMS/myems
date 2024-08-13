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
(1,'Modbus TCP', 'modbus-tcp'),
(2,'BACnet/IP', 'bacnet-ip'),
(3,'Cassandra', 'cassandra'),
(4,'ClickHouse', 'clickhouse'),
(5,'CoAP', 'coap'),
(6,'ControlLogix', 'controllogix'),
(7,'DL/T645', 'dlt645'),
(8,'DTU-RTU', 'dtu-rtu'),
(9,'DTU-TCP', 'dtu-tcp'),
(10,'DTU-MQTT', 'dtu-mqtt'),
(11,'Elexon BMRS', 'elexon-bmrs'),
(12,'IEC 104', 'iec104'),
(13,'InfluxDB', 'influxdb'),
(14,'LoRa', 'lora'),
(15,'Modbus RTU', 'modbus-rtu'),
(16,'MongoDB', 'mongodb'),
(17,'MQTT Acrel', 'mqtt-acrel'),
(18,'MQTT ADW300', 'mqtt-adw300'),
(19,'MQTT Huiju', 'mqtt-huiju'),
(20,'MQTT MD4220', 'mqtt-md4220'),
(21,'MQTT SEG', 'mqtt-seg'),
(22,'MQTT Weilan', 'mqtt-weilan'),
(23,'MQTT Xintianli', 'mqtt-xintianli'),
(24,'MQTT Zhongxian', 'mqtt-zhongxian'),
(25,'MQTT', 'mqtt'),
(26,'MySQL', 'mysql'),
(27,'OPC UA', 'opc-ua'),
(28,'Oracle', 'oracle'),
(29,'Postgresql', 'postgresql'),
(30,'Profibus', 'profibus'),
(31,'PROFINET', 'profinet'),
(32,'S7', 's7'),
(33,'Simulation', 'simulation'),
(34,'SQL Server', 'sqlserver'),
(35,'TDengine', 'tdengine'),
(36,'Weather', 'weather');

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.7.0', release_date='2024-07-08' WHERE id=1;

COMMIT;

