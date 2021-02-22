-- MyEMS System Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_system_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_system_db` ;
CREATE DATABASE IF NOT EXISTS `myems_system_db` ;
USE `myems_system_db` ;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_index_1` ON  `myems_system_db`.`tbl_combined_equipments`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_combined_equipments`
-- (`id`, `name`, `uuid`,  `is_input_counted`, `is_output_counted`, `cost_center_id`, `description` )
-- VALUES
-- (1, '组合式设备1', '48aab70f-2e32-4518-9986-a6b7395acf58', true, false, 1, 'description'),
-- (2, '组合式设备2', 'c235e68c-e1be-4d7a-84e7-976c83ff6e44', true, false, 1,  'description');

-- COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_equipments_index_1` ON  `myems_system_db`.`tbl_combined_equipments_equipments`   (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_combined_equipments_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_combined_equipments_equipments`
-- (`id`, `combined_equipment_id`, `equipment_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_meters_index_1` ON  `myems_system_db`.`tbl_combined_equipments_meters`   (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_combined_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_combined_equipments_meters`
-- (`id`, `combined_equipment_id`, `meter_id`, `is_output`)
-- VALUES
-- (1, 1, 1, false);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_offline_meters_index_1` ON  `myems_system_db`.`tbl_combined_equipments_offline_meters`   (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_combined_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_combined_equipments_offline_meters`
-- (`id`, `combined_equipment_id`, `offline_meter_id`, `is_output`)
-- VALUES
-- (1, 1, 1, false);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_parameters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_parameters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `parameter_type` VARCHAR(255)  COMMENT 'constant, point, fraction',
  `constant` VARCHAR(255) COMMENT 'NULL if type is not constant else string ',
  `point_id` BIGINT COMMENT 'NULL if type is not point else point ID ',
  `numerator_meter_uuid` CHAR(36) COMMENT 'the number above the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  `denominator_meter_uuid` CHAR(36) COMMENT 'the number below the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipment_parameters_index_1` ON  `myems_system_db`.`tbl_combined_equipments_parameters`   (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_combined_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
--
-- INSERT INTO `myems_system_db`.`tbl_combined_equipments_parameters`
-- (`id`, `combined_equipment_id`, `name`, `parameter_type`, `constant`, `point_id`, `numerator_meter_uuid`, `denominator_meter_uuid`)
-- VALUES
-- (1, 1, 'serial number', 'constant', 'bfa8b106', NULL, NULL, NULL),
-- (2, 1, 'manufacturer', 'constant', 'York', NULL, NULL, NULL),
-- (3, 1, 'maintainer', 'constant', 'Johnson Controls', NULL, NULL, NULL),
-- (4, 1, 'use life start', 'constant', '2016-01-01', NULL, NULL, NULL),
-- (5, 1, 'use life end', 'constant', '2025-12-31', NULL, NULL, NULL),
-- (6, 1, 'model number', 'constant', 'CH01', NULL, NULL, NULL),
-- (7, 1, 'nominal cooling capacity', 'constant', '90.000 kW', NULL, NULL, NULL),
-- (8, 1, 'nominal cooling input power', 'constant', '100.000 kW', NULL, NULL, NULL),
-- (9, 1, 'nominal cooling cop', 'constant', '5', NULL, NULL, NULL),
-- (10, 1, 'nominal cooling operating current', 'constant', '120.000 A', NULL, NULL, NULL),
-- (11, 1, 'rated input power', 'constant', '100.000 kW', NULL, NULL, NULL),
-- (12, 1, 'nominal chilled water flow rate', 'constant', '30 m2/h', NULL, NULL, NULL),
-- (13, 1, 'nominal cooling water flow_rate', 'constant', '50 m2/h', NULL, NULL, NULL),
-- (14, 1, 'status', 'point', NULL, 1, NULL, NULL),
-- (15, 1, 'inlet chilled water temperature', 'point', NULL, 2, NULL, NULL),
-- (16, 1, 'chilled_water instantaneous flow rate', 'point', NULL, 3, NULL, NULL),
-- (17, 1, 'instantaneous power', 'point', NULL, 4, NULL, NULL),
-- (18, 1, 'COP', 'fraction', NULL, NULL, 'a4e0dbf0-528a-4cbb-88cc-563527900d40', '89ff5118-d0c2-4dd8-8098-a8698189b2ea');
--
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_virtual_meters_index_1` ON  `myems_system_db`.`tbl_combined_equipments_virtual_meters`   (`combined_equipment_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_combined_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_combined_equipments_virtual_meters`
-- (`id`, `combined_equipment_id`, `virtual_meter_id`, `is_output`)
-- VALUES
-- (1, 1, 1, false);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_contacts`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_contacts` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_contacts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) ,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_contacts`
-- ---------------------------------------------------------------------------------------------------------------------
  START TRANSACTION;
  USE `myems_system_db`;
  INSERT INTO `myems_system_db`.`tbl_contacts`(`id`, `name`, `uuid`, `email`, `phone`, `description`)
  VALUES
  (1, 'John', '5c5ce6e8-8d00-46b3-9602-4e1520a8b43f',  'john@myems.io', '+8613888888888', 'Building #1'),
  (2, 'Sample Tenant', '102b654d-e831-4365-bb1e-dbd55e897851',  'sample.tenant@myems.io', '+8613666666666', 'Sample Tenant');
  COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_cost_centers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_cost_centers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_cost_centers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `external_id` VARCHAR(36) COMMENT 'ID in external syste, such as SAP, ERP',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_cost_centers_index_1` ON  `myems_system_db`.`tbl_cost_centers`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_cost_centers`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_cost_centers`
(`id`, `name`, `uuid`, `external_id`)
VALUES
(1, '成本中心', 'd97b9736-c4f9-4005-a534-6af3487303ad', NULL);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_cost_centers_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_cost_centers_tariffs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_cost_centers_tariffs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cost_center_id` BIGINT NOT NULL,
  `tariff_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_cost_centers_tariffs_index_1` ON  `myems_system_db`.`tbl_cost_centers_tariffs`   (`cost_center_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_cost_centers_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
-- INSERT INTO `myems_system_db`.`tbl_cost_centers_tariffs`
-- (`id`, `cost_center_id`, `tariff_id`)
-- VALUES
-- (1, 1, 1),
-- (2, 1, 2),
-- (3, 1, 3);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_data_sources` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `gateway_id` BIGINT NOT NULL,
  `protocol` VARCHAR(16) NOT NULL,
  `connection` JSON NOT NULL,
  `last_seen_datetime_utc` DATETIME NULL  COMMENT 'The last seen date time in UTC via PING or TELNET',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_data_sources_index_1` ON  `myems_system_db`.`tbl_data_sources`   (`name`);
CREATE INDEX `tbl_data_sources_index_2` ON  `myems_system_db`.`tbl_data_sources`   (`gateway_id`);
CREATE INDEX `tbl_data_sources_index_3` ON  `myems_system_db`.`tbl_data_sources`   (`protocol`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_data_sources`
-- (`id`, `name`, `uuid`,`gateway_id`, `protocol`,  `connection`)
-- VALUES
-- (1, '示例ModbusTCP数据源', 1, 'b3ace9d4-b63b-419b-818f-0f6d1d0603a4', 'modbus-tcp', '{"host":"10.111.212.191", "port":502}'),
-- (2, '示例ModbusRTU数据源', 1, 'b903f0af-9115-448c-9d46-8caf5f9995f3', 'modbus-tru', '{"port": "/dev/ttyUSB0","slaveaddress": 1, "baudrate": 9600,"bytesize": 8,"parity": "N","stopbits": 1,"timeout": 0.05,"mode": "rtu"}''),
-- (3, '示例Bacnet/IP数据源', 1, 'e2d5b30b-b554-4ebe-8ce7-f377ab380d19', 'bacnet-ip', '{"host":"10.111.212.200", "port":47808}'),
-- (4, '示例S7数据源', 1, '9eb0d705-d02a-43f8-9c62-7e5ef508b255', 's7', '{"host":"10.111.212.202", "port":102, "rack": 0, "slot": 2}'),
-- (5, '示例ControlLogix数据源', 1, 'd1dc9792-7861-4dd3-9b01-07511dae16c1', 'control-logix', '{"host":"10.111.212.203","port":44818,"processorslot":3}');
-- (6, '示例OPU UA数据源', 1, '56e1c642-8032-495b-af2e-18a77ca75e0f', 'opc-ua', '{"url":"opc.tcp://10.111.212.5:49320/OPCUA/SimulationServer/"}');
-- (7, '示例天气数据源', 1, '9bff8e95-c7c9-4002-b040-08a96ae196b5', 'weather', '{"base_url":"WEATHER_API_URL", "location":"beijing", "key":"APPKEY"}');
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_circuits`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_circuits` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_circuits` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `distribution_system_id` BIGINT NOT NULL,
  `distribution_room` VARCHAR(255) NOT NULL COMMENT '配电房, 配电间',
  `switchgear` VARCHAR(255) NOT NULL COMMENT '高/低压配电柜',
  `peak_load` DECIMAL(18, 3)  COMMENT '最大容量, 设备容量(KW)',
  `peak_current` DECIMAL(18, 3) COMMENT '最大电流, 计算电流(A)',
  `customers` VARCHAR(255) COMMENT '用电设备, 用户',
  `meters` VARCHAR(255) COMMENT '出线电表, 下级电表',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_circuits_index_1` ON  `myems_system_db`.`tbl_distribution_circuits`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_distribution_circuits`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
--
-- INSERT INTO `myems_system_db`.`tbl_distribution_circuits`
-- (`id`, `name`, `uuid`, `distribution_system_id`, `distribution_room`, `switchgear`, `peak_load`, `peak_current`, `customers`, `meters`)
-- VALUES
-- (1, '51W91', '52f7abe1-ba0e-47a6-a327-4faac42a1d11', 1, 'EW1', '51AL9', 30, 53.6, '地下室应急照明', 'ALE-1102, ALE-1082');
--
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_circuits_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_circuits_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_circuits_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `distribution_circuit_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_circuits_points_index_1` ON  `myems_system_db`.`tbl_distribution_circuits_points`   (`distribution_circuit_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_distribution_circuits_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_distribution_circuits_points`
-- (`id`, `distribution_circuit_id`, `point_id`)
-- VALUES (1, 1, 1);
-- COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `svg` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_systems_index_1` ON  `myems_system_db`.`tbl_distribution_systems`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_distribution_systems`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
--
-- INSERT INTO `myems_system_db`.`tbl_distribution_systems`
-- (`id`, `name`, `uuid`, `svg`,  `description`)
-- VALUES
-- (1, '示例配电系统', '95652719-56fa-44cc-9bef-7aa47664d4ff', '<?xml version="1.0" encoding="UTF-8"?><svg width="5cm" height="4cm" version="1.1" xmlns="http://www.w3.org/2000/svg"><desc>Four separate rectangles</desc><rect x=".5cm" y=".5cm" width="2cm" height="1cm"/></svg>', 'demo distribution system');
--
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_categories`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_categories` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `unit_of_measure` VARCHAR(32) NOT NULL,
  `kgce` DECIMAL(18, 3) NOT NULL COMMENT 'Kilogram of Coal Equivalent',
  `kgco2e` DECIMAL(18, 3) NOT NULL COMMENT 'Carbon Dioxide Emissions Factor',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_categories_index_1` ON  `myems_system_db`.`tbl_energy_categories`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_energy_categories`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_energy_categories`
(`id`, `name`, `uuid`, `unit_of_measure`, `kgce`, `kgco2e`)
VALUES
(1, '电', '6d0753ed-8b43-4332-b6fd-d2f5813831d3', 'kWh', 0.1229, 0.928),
(2, '自来水', '3dbfa598-fccc-4d60-bf11-14bd55540c66', 'm³', 0.0857, 0.910),
(3, '天然气', '6d0753ed-8b43-4332-b6fd-d2f5813831d3', 'm³', 1.3300, 2.1622),
(4,'4℃冷冻水','d2a3021a-4911-4611-856e-80133000f1d5','m³',1.000,1.000),
(5,'7℃冷冻水','c1ad0696-e1ab-4e0c-a342-b194c0bc27e0','m³',1.000,1.000),
(6,'蒸汽','ac91a5c4-4ae5-4a73-8e3f-044591f42eef','T',1.000,1.000),
(7,'压缩空气','ff238e98-cd35-47c5-88a3-00617587775d','m³',1.000,1.000),
(8,'循环水','7e159a34-b2e6-4fd3-ba76-897d134abe06','m³',1.000,1.000),
(9, '热量','549f9cad-8db7-49d2-9473-95e37a3fc46a','KJ',1.000,1.000),
(10, '冷量','05aa257b-3cf6-4f19-808d-92e7dbf52b16','KJ',1.000,1.000),
(11, '中水','df6161b6-4a1b-46e7-b7c8-337b5b52d717','m³',1.000,1.000);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_items`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_items` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_items_index_1` ON  `myems_system_db`.`tbl_energy_items`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_energy_items`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_energy_items`
(`id`, `name`, `uuid`, `energy_category_id`)
VALUES
(1, '空调用电', 'c5eac07a-e889-4a56-aa1b-a0b688c4e953', 1),
(2, '动力用电', '6875e4e0-a2ec-47a5-a88e-becb10e9603a', 1),
(3, '照明用电', '79918598-6477-4130-a85c-4cb87d0eac23', 1);

COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_index_1` ON  `myems_system_db`.`tbl_energy_flow_diagrams`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_energy_flow_diagrams`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
--
-- INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams`
-- (`id`, `name`, `uuid`)
-- VALUES
-- (1, '低压配电系统', '3ccbc9c6-9575-4212-a63a-a688d1154302');
--
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams_links`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_links` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_links` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_flow_diagram_id` BIGINT NOT NULL,
  `source_node_id` BIGINT NOT NULL,
  `target_node_id` BIGINT NOT NULL,
  `meter_uuid` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_links_index_1` ON  `myems_system_db`.`tbl_energy_flow_diagrams_links`   (`energy_flow_diagram_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_energy_flow_diagrams_links`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
--
-- INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams_links`
-- (`id`, `energy_flow_diagram_id`, `name`)
-- VALUES
-- (1, 1, 1, 3, '5ca47bc5-22c2-47fc-b906-33222191ea40'),
-- (2, 1, 2, 4, '5d4d2f06-6200-4671-b182-4cf32cd9228f'),
-- (3, 1, 2, 5, '7897665b-66ac-481d-9c31-2ab2ecbda16c'),
-- (4, 1, 2, 6, 'f0c278ec-eb32-4c5e-a35f-88643b00c367'),
-- (5, 1, 3, 7, '9918aa6c-79e9-4579-8f2e-a76eb9fe4e3e'),
-- (6, 1, 3, 8, '831cbc8c-1429-4840-946e-f0b389b2253e'),
-- (7, 1, 4, 9, 'd2fc8464-3f13-42a9-8a57-63f95f677f0f'),
-- (8, 1, 4, 10, '7e4b3831-887b-40e2-b7f8-4d77c6f206a9');
--
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_nodes` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_nodes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_flow_diagram_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_nodes_index_1` ON  `myems_system_db`.`tbl_energy_flow_diagrams_nodes`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
--
-- INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
-- (`id`, `energy_flow_diagram_id`, `name`)
-- VALUES
-- (1, 1, '10KV进线#1'),
-- (2, 1, '10KV进线#2'),
-- (3, 1, '租区'),
-- (4, 1, '公区'),
-- (5, 1, '酒店'),
-- (6, 1, '车库'),
-- (7, 1, '餐饮'),
-- (8, 1, '零售'),
-- (9, 1, '照明'),
-- (10, 1, '电梯');
--
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_index_1` ON  `myems_system_db`.`tbl_equipments`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_equipments`
-- (`id`, `name`, `uuid`,  `is_input_counted`, `is_output_counted`, `cost_center_id`,  `description` )
-- VALUES
-- (1, '设备1', 'bfa8b106-89a1-49ca-9b2b-a481ac41a873', true, false, 1, 'description'),
-- (2, '设备2', 'ad5798ec-d827-43d9-bf08-fc7516f9c4c8', true, false, 1, 'description');

-- COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_meters_index_1` ON  `myems_system_db`.`tbl_equipments_meters`   (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_equipments_meters`
-- (`id`, `equipment_id`, `meter_id`, `is_output`)
-- VALUES
-- (1, 1, 1, false);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_offline_meters_index_1` ON  `myems_system_db`.`tbl_equipments_offline_meters`   (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_equipments_offline_meters`
-- (`id`, `equipment_id`, `offline_meter_id`, `is_output`)
-- VALUES
-- (1, 1, 1, false);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_parameters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_parameters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `parameter_type` VARCHAR(255)  COMMENT 'constant, point, fraction',
  `constant` VARCHAR(255) COMMENT 'NULL if type is not constant else string ',
  `point_id` BIGINT COMMENT 'NULL if type is not point else point ID ',
  `numerator_meter_uuid` CHAR(36) COMMENT 'the number above the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  `denominator_meter_uuid` CHAR(36) COMMENT 'the number below the line in a common fraction. NULL if type is not fraction else may be meter uuid, offline meter uuid or virtual meter uuid',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipment_parameters_index_1` ON  `myems_system_db`.`tbl_equipments_parameters`   (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
--
-- INSERT INTO `myems_system_db`.`tbl_equipments_parameters`
-- (`id`, `equipment_id`, `name`, `parameter_type`, `constant`, `point_id`, `numerator_meter_uuid`, `denominator_meter_uuid`)
-- VALUES
-- (1, 1, 'serial number', 'constant', 'bfa8b106', NULL, NULL, NULL),
-- (2, 1, 'manufacturer', 'constant', 'York', NULL, NULL, NULL),
-- (3, 1, 'maintainer', 'constant', 'Johnson Controls', NULL, NULL, NULL),
-- (4, 1, 'use life start', 'constant', '2016-01-01', NULL, NULL, NULL),
-- (5, 1, 'use life end', 'constant', '2025-12-31', NULL, NULL, NULL),
-- (6, 1, 'model number', 'constant', 'CH01', NULL, NULL, NULL),
-- (7, 1, 'nominal cooling capacity', 'constant', '90.000 kW', NULL, NULL, NULL),
-- (8, 1, 'nominal cooling input power', 'constant', '100.000 kW', NULL, NULL, NULL),
-- (9, 1, 'nominal cooling cop', 'constant', '5', NULL, NULL, NULL),
-- (10, 1, 'nominal cooling operating current', 'constant', '120.000 A', NULL, NULL, NULL),
-- (11, 1, 'rated input power', 'constant', '100.000 kW', NULL, NULL, NULL),
-- (12, 1, 'nominal chilled water flow rate', 'constant', '30 m2/h', NULL, NULL, NULL),
-- (13, 1, 'nominal cooling water flow_rate', 'constant', '50 m2/h', NULL, NULL, NULL),
-- (14, 1, 'status', 'point', NULL, 1, NULL, NULL),
-- (15, 1, 'inlet chilled water temperature', 'point', NULL, 2, NULL, NULL),
-- (16, 1, 'chilled_water instantaneous flow rate', 'point', NULL, 3, NULL, NULL),
-- (17, 1, 'instantaneous power', 'point', NULL, 4, NULL, NULL),
-- (18, 1, 'COP', 'fraction', NULL, NULL, 'a4e0dbf0-528a-4cbb-88cc-563527900d40', '89ff5118-d0c2-4dd8-8098-a8698189b2ea');
--
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `is_output` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_virtual_meters_index_1` ON  `myems_system_db`.`tbl_equipments_virtual_meters`   (`equipment_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_equipments_virtual_meters`
-- (`id`, `equipment_id`, `virtual_meter_id`, `is_output`)
-- VALUES
-- (1, 1, 1, false);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_expressions`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_expressions` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_expressions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `equation` VARCHAR(1024) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_expressions_index_1` ON  `myems_system_db`.`tbl_expressions`   (`virtual_meter_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_expressions`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_expressions`
-- (`id`, `uuid`, `virtual_meter_id`, `equation`)
-- VALUES
-- (1, '3fff2cfb-f755-44c8-a919-6135205a8573', 1, 'x+y-z');
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_gateways`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_gateways` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_gateways` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `token` CHAR(36) NOT NULL,
  `last_seen_datetime_utc` DATETIME NULL  COMMENT 'The last seen date time in UTC via PING, TELNET or Heatbeat',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_gateways_index_1` ON  `myems_system_db`.`tbl_gateways`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_gateways`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_gateways`
(`id`, `name`, `uuid`, `token`,  `last_seen_datetime_utc`)
VALUES
(1, 'MyEMS Gateway 1', 'dc681934-5053-4660-98ed-266c54227231', '983427af-1c35-42ba-8b4d-288675550225', null),
(2, 'MyEMS Gateway 2', '8f75c0ab-9296-49c7-9058-8139febd0c31', 'd3860971-e6e0-4c98-9eba-5492869c5b19', null);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_knowledge_files`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_knowledge_files` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_knowledge_files` (
`id` BIGINT NOT NULL AUTO_INCREMENT,
`file_name` VARCHAR(255) NOT NULL,
`uuid` CHAR(36) NOT NULL,
`upload_datetime_utc` DATETIME NOT NULL,
`upload_user_uuid` CHAR(36) NOT NULL,
`file_object` LONGBLOB NOT NULL,
PRIMARY KEY (`id`));
CREATE INDEX `tbl_knowledge_files_index_1` ON  `myems_system_db`.`tbl_knowledge_files`   (`file_name`);
CREATE INDEX `tbl_knowledge_files_index_2` ON  `myems_system_db`.`tbl_knowledge_files`   (`upload_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `hourly_low_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Default is 0. If the meter has accuracy problems, set the value to a small positive value, such as 0.100',
  `hourly_high_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Maximum energy consumption per hour, Rated total active Power, Rated Flow, etc.',
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `master_meter_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_index_1` ON  `myems_system_db`.`tbl_meters`   (`name`);
CREATE INDEX `tbl_meters_index_2` ON  `myems_system_db`.`tbl_meters`   (`energy_category_id`);
CREATE INDEX `tbl_meters_index_3` ON  `myems_system_db`.`tbl_meters`   (`energy_item_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_meters`
-- (`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `max_hourly_value`, `cost_center_id`, `energy_item_id`, `master_meter_id`, `description`)
-- VALUES
-- (1, '示例表1', '5ca47bc5-22c2-47fc-b906-33222191ea40', 1, true, 0.000, 999.999, 1, 1, null, 'meter1'),
-- (2, '示例表2', '5ca47bc5-22c2-47fc-b906-33222191ea40', 1, true, 0.000, 999.999, 1, 1, 1,  'meter2'),
-- (3, '示例表3', '6db58cd6-33d3-58ed-a095-22333202fb51', 1, true, 0.000, 999.999, 1, 1, 1,  'meter3');

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_points_index_1` ON  `myems_system_db`.`tbl_meters_points`   (`meter_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_meters_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_meters_points`
-- (`id`, `meter_id`, `point_id`)
-- VALUES (1, 1, 1);
-- COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `hourly_low_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Default is 0. If the meter has accuracy problems, set the value to a small positive value, such as 0.100',
  `hourly_high_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Maximum energy consumption per hour, Rated total active Power, Rated Flow, etc.',
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meters_index_1` ON  `myems_system_db`.`tbl_offline_meters`   (`name`);
CREATE INDEX `tbl_offline_meters_index_2` ON  `myems_system_db`.`tbl_offline_meters`   (`energy_category_id`);
CREATE INDEX `tbl_offline_meters_index_3` ON  `myems_system_db`.`tbl_offline_meters`   (`energy_item_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_offline_meters`
-- (`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `max_hourly_value`, `cost_center_id`, `energy_item_id`, `description`)
-- VALUES
-- (1, '示例离线表', '62f473e0-1a35-41f3-9c30-8110d75d65bb', 1, true, 999.99, 1, 1, 'offlinemeter1');
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(512) NOT NULL,
  `data_source_id` BIGINT NOT NULL,
  `object_type` VARCHAR(32) NOT NULL,
  `units` VARCHAR(32) NOT NULL,
  `high_limit` DECIMAL(18, 3) NOT NULL,
  `low_limit` DECIMAL(18, 3) DEFAULT 1.000 NOT NULL ,
  `ratio` DECIMAL(18, 3) DEFAULT 1.000 NOT NULL,
  `is_trend` BOOL NOT NULL,
  `address` JSON NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_points_index_1` ON  `myems_system_db`.`tbl_points`   (`name`);
CREATE INDEX `tbl_points_index_2` ON  `myems_system_db`.`tbl_points`   (`data_source_id`);
CREATE INDEX `tbl_points_index_3` ON  `myems_system_db`.`tbl_points`   (`id`, `object_type`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- List of Object Type
-- ENERGY_VALUE
-- ANALOG_VALUE
-- DIGITAL_VALUE

-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_points`
-- (`id`, `name`, `data_source_id`, `object_type`, `units`, `low_limit`, `high_limit`, `ratio`, `is_trend`, `address`, `description` )
-- VALUES
-- (1, 'Active Energy Import Tariff 1', 1, 'ENERGY_VALUE', 'kWh', 0, 99999999999, 1.000, true,
--   '{\"slave_id\":1, \"function_code\":3, \"offset\":801, \"number_of_registers\":4, \"format\":\"=d\", \"swap_adjacent_bytes\":false}', null),

-- (2, 'Working hours counter', 1, 'ANALOG_VALUE',  'S', 0, 999999999, 1.000, true,
--   '{\"slave_id\":1, \"function_code\":3, \"offset\":209, \"number_of_registers\":2, \"format\":\"=L\", \"swap_adjacent_bytes\":true}', null),

-- (3, 'Current a', 1, 'ANALOG_VALUE',  'A', 0, 5, 1.000, true,
--   '{\"slave_id\":1, \"function_code\":3, \"offset\":13, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

-- (4, 'Active Power a', 1, 'ANALOG_VALUE',  'W', 0, 3450, 1.000, true,
--   '{\"slave_id\":1, \"function_code\":3, \"offset\":25, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

-- (5, 'Power Factor a', 1, 'ANALOG_VALUE',  'W', 0, 1, 1.000, true,
--   '{\"slave_id\":1, \"function_code\":3, \"offset\":37, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

-- (6, '示例ModbusTCP数据点6', 2, 'ENERGY_VALUE',  'Wh', 0, 99999999999, 1.000, true,
--   '{\"slave_id\":1, \"function_code\":3, \"offset\":40001, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

-- (7, '示例数据点7', 2, 'ANALOG_VALUE',  'V', 0, 690, 1.000, true,
--   '{\"slave_id\":1, \"function_code\":3, \"offset\":40002, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

-- (8, 'BACnet示例数据点1', 3, 'ANALOG_VALUE',  'V', 0, 690, 1.000, true,
--   '{\"object_type\":\"analogValue\", \"object_id\":3004860, \"property_name\":\"presentValue\", \"property_array_index\":null}', null),
-- BACnet Object Type
-- analogValue, analogInput, analogOutput, binaryValue, binaryInput, binaryOutput

-- (9, 'S7示例数据点1', 4, 'ANALOG_VALUE',  'kWh', 0, 99999999999, 1.000, true,
--   '{\"area\":\"DB\", \"db_number\":700, \"start\":8, \"size\":4', null);
-- # S7 Area
-- 'PE', 'PA', 'MK', 'DB', 'CT', 'TM'

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_sensors_index_1` ON  `myems_system_db`.`tbl_sensors`   (`name`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_sensors`
-- (`id`, `name`, `uuid`, `description`)
-- VALUES
-- (1, '示例传感器', 'ba450606-6f39-41e0-8caf-75b528635511', 'sensor description');
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_sensors_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_sensors_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_sensors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sensor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_sensors_points_index_1` ON  `myems_system_db`.`tbl_sensors_points`   (`sensor_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_sensors_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_sensors_points`
-- (`id`, `sensor_id`, `point_id`)
-- VALUES (1, 1, 1);
-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `area` DECIMAL(18, 3) NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `contact_id` BIGINT,
  `cost_center_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_index_1` ON  `myems_system_db`.`tbl_shopfloors`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors`
(`id`, `name`, `uuid` , `area`, `contact_id`, `is_input_counted`,  `cost_center_id`, `description`)
VALUES
    (1, 'MyEMS Shopfloor', 'd03837fd-9d30-44fe-9443-154f7c7e15f1',  99999.999, 1, true, 1,  'MyEMS Project');
COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_equipments_index_1` ON  `myems_system_db`.`tbl_shopfloors_equipments`   (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_shopfloors_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_shopfloors_equipments`
-- (`id`, `shopfloor_id`, `equipment_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_meters_index_1` ON  `myems_system_db`.`tbl_shopfloors_meters`   (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_shopfloors_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_shopfloors_meters`
-- (`id`, `shopfloor_id`, `meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_offline_meters_index_1` ON  `myems_system_db`.`tbl_shopfloors_offline_meters`   (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_shopfloors_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_shopfloors_offline_meters`
-- (`id`, `shopfloor_id`, `offline_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_sensors_index_1` ON  `myems_system_db`.`tbl_shopfloors_sensors`   (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_shopfloors_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_shopfloors_sensors`
-- (`id`, `shopfloor_id`, `sensor_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_virtual_meters_index_1` ON  `myems_system_db`.`tbl_shopfloors_virtual_meters`   (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_shopfloors_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_shopfloors_virtual_meters`
-- (`id`, `shopfloor_id`, `virtual_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_points_index_1` ON  `myems_system_db`.`tbl_shopfloors_points`   (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_shopfloors_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_shopfloors_points`
-- (`id`, `shopfloor_id`, `point_id`)
-- VALUES
-- (1, 3, 2000001),
-- (2, 3, 2000002),
-- (3, 3, 2000003),
-- (4, 3, 2000006);

-- COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `parent_space_id` BIGINT,
  `area` DECIMAL(18, 3) NOT NULL,
  `timezone_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `contact_id` BIGINT,
  `cost_center_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_index_1` ON  `myems_system_db`.`tbl_spaces`   (`name`);
CREATE INDEX `tbl_spaces_index_2` ON  `myems_system_db`.`tbl_spaces`   (`parent_space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces`
(`id`, `name`, `uuid`, `parent_space_id`, `area`, `timezone_id`, `contact_id`, `is_input_counted`, `is_output_counted`, `cost_center_id`, `description`)
VALUES
    -- DO NOT deleted the record which ID is 1. It's the root space.
    (1, 'MyEMS Headquarter', '9dfb7cff-f19f-4a1e-8c79-3adf6425bfd9', NULL, 99999.999, 56, 1, true, true, 1,  'MyEMS Project'),
    (2, 'MyEMS Building #1', '8f25b33b-db93-49b3-b0f8-b01e0c19df29', 1, 88888.888, 56, 1, true, true, 1,  'MyEMS Project'),
    (3, 'MyEMS Building #2', '195d7ea8-17b4-4e9c-bb37-546428155438', 1, 66666.666, 56, 1, true, true, 1, 'MyEMS Project');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_combined_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_combined_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `combined_equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_combined_equipments_index_1` ON  `myems_system_db`.`tbl_spaces_combined_equipments`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_combined_equipments`
-- (`id`, `space_id`, `combined_equipment_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_equipments_index_1` ON  `myems_system_db`.`tbl_spaces_equipments`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_equipments`
-- (`id`, `space_id`, `equipment_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_meters_index_1` ON  `myems_system_db`.`tbl_spaces_meters`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_meters`
-- (`id`, `space_id`, `meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_offline_meters_index_1` ON  `myems_system_db`.`tbl_spaces_offline_meters`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_offline_meters`
-- (`id`, `space_id`, `offline_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_sensors_index_1` ON  `myems_system_db`.`tbl_spaces_sensors`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_sensors`
-- (`id`, `space_id`, `sensor_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_shopfloors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_shopfloors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `shopfloor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_sensors_index_1` ON  `myems_system_db`.`tbl_spaces_shopfloors`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_shopfloors`
-- (`id`, `space_id`, `shopfloor_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_stores`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_stores` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_stores` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `store_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_stores_index_1` ON  `myems_system_db`.`tbl_spaces_stores`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_stores`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_stores`
-- (`id`, `space_id`, `store_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_tenants` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_tenants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `tenant_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_tenants_index_1` ON  `myems_system_db`.`tbl_spaces_tenants`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_tenants`
-- (`id`, `space_id`, `tenant_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_virtual_meters_index_1` ON  `myems_system_db`.`tbl_spaces_virtual_meters`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaes_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaes_virtual_meters`
-- (`id`, `space_id`, `virtual_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_points_index_1` ON  `myems_system_db`.`tbl_spaces_points`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_spaces_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_spaces_points`
-- (`id`, `space_id`, `point_id`)
-- VALUES
-- (1, 3, 2000001),
-- (2, 3, 2000002),
-- (3, 3, 2000003),
-- (4, 3, 2000006);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tariffs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `tariff_type` VARCHAR(45) NOT NULL COMMENT 'Tariff Type: timeofuse - Time of Use Pricing分时费率（单一费率按平设置）\nblock - Block Pricing 分量阶梯费率\n',
  `unit_of_price` VARCHAR(45) NOT NULL,
  `valid_from_datetime_utc` DATETIME NOT NULL,
  `valid_through_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tariffs_parameters_index_1` ON  `myems_system_db`.`tbl_tariffs`   (`name`);
CREATE INDEX `tbl_tariffs_parameters_index_2` ON  `myems_system_db`.`tbl_tariffs`   (`energy_category_id`, `valid_from_datetime_utc`,  `valid_through_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tariffs`
(`id`, `name`, `uuid`, `energy_category_id`, `tariff_type`, `unit_of_price`, `valid_from_datetime_utc`, `valid_through_datetime_utc`)
VALUES
(1, '2020分时电价1-6',    '590efb36-8587-42a9-ae6f-c715d21496d6', 1, 'timeofuse', '元/千瓦时', '2019-12-31 16:00:00', '2020-06-30 15:59:59'),
(2, '2020分时电价7-9',    'f5966640-18fc-437a-9efd-cbc0c58b6373', 1, 'timeofuse', '元/千瓦时', '2020-06-30 16:00:00', '2020-09-30 15:59:59'),
(3, '2020分时电价10-12',  '21727a1b-4b27-4186-b72e-db46e6e2d980', 1, 'timeofuse', '元/千瓦时', '2020-09-30 16:00:00', '2020-12-31 15:59:59'),
(4, '2021分时电价1-6',    'fe65e443-0ec2-4a16-823e-2365885e2598', 1, 'timeofuse', '元/千瓦时', '2020-12-31 16:00:00', '2021-06-30 15:59:59'),
(5, '2021分时电价7-9',    'd1285c81-4612-4d7c-9436-ed11b4e7abe4', 1, 'timeofuse', '元/千瓦时', '2021-06-30 16:00:00', '2021-09-30 15:59:59'),
(6, '2021分时电价10-12',  'e6c275b4-47eb-4f5d-bc59-edbe45c2a407', 1, 'timeofuse', '元/千瓦时', '2021-09-30 16:00:00', '2021-12-31 15:59:59'),
(7, '2022分时电价1-6',    'ca359f72-48ad-46a7-82af-cecbe98450e8', 1, 'timeofuse', '元/千瓦时', '2021-12-31 16:00:00', '2022-06-30 15:59:59'),
(8, '2022分时电价7-9',    '9fdda603-0f8f-4452-ad59-c5df54bc35f4', 1, 'timeofuse', '元/千瓦时', '2022-06-30 16:00:00', '2022-09-30 15:59:59'),
(9, '2022分时电价10-12',  'fb0442e7-4d44-4bfd-8b20-cad3f77a2480', 1, 'timeofuse', '元/千瓦时', '2022-09-30 16:00:00', '2022-12-31 15:59:59'),
(10, '2023分时电价1-6',   '3fa6e1f2-7d08-4f5a-bcbf-beb041d569c0', 1, 'timeofuse', '元/千瓦时', '2022-12-31 16:00:00', '2023-06-30 15:59:59'),
(11, '2023分时电价7-9',   '787240fb-1694-403e-a0a7-83d7be1cc0b8', 1, 'timeofuse', '元/千瓦时', '2023-06-30 16:00:00', '2023-09-30 15:59:59'),
(12, '2023分时电价10-12', 'a07fdf76-edcf-4124-96e7-ab733a5a4b70', 1, 'timeofuse', '元/千瓦时', '2023-09-30 16:00:00', '2023-12-31 15:59:59'),
(13, '自来水',  '6fcbc77e-effb-4d43-9b30-77b062435d34', 2, 'timeofuse', '元/m³',    '2019-12-31 16:00:00', '2023-12-31 15:59:59'),
(14, '天然气', '6a4c56ff-b3e1-4555-9b1c-87d05bcfa4d9', 3, 'timeofuse', '元/m³',    '2019-12-31 16:00:00', '2023-12-31 15:59:59'),
(15, '分量阶梯电价', 'd1b81d2f-d387-43d3-affd-d796b7236b60', 1, 'block',     '元/千瓦时', '2019-12-31 16:00:00', '2023-12-31 15:59:59');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tariffs_timeofuses`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs_timeofuses` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tariffs_timeofuses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tariff_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `peak_type` VARCHAR(8) NOT NULL COMMENT 'Peak Type: \ntoppeak - Top Peak尖\nonpeak - On Peak峰\nmidpeak - Middle Peak平\noffpeak - Off Peak谷',
  `price` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tariffs_timeofuses_index_1` ON  `myems_system_db`.`tbl_tariffs_timeofuses`   (`tariff_id`, `start_time_of_day`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tariffs_timeofuses`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tariffs_timeofuses`
(`id`, `tariff_id`, `start_time_of_day`, `end_time_of_day`, `peak_type`, `price`)
VALUES
-- '2020分时电价1-6'
(1,  1, '00:00:00', '05:59:59', 'offpeak', 0.345),
(2,  1, '06:00:00', '07:59:59', 'midpeak', 0.708),
(3,  1, '08:00:00', '10:59:59', 'onpeak', 1.159),
(4,  1, '11:00:00', '17:59:59', 'midpeak', 0.708),
(5,  1, '18:00:00', '20:59:59', 'onpeak', 1.159),
(6,  1, '21:00:00', '21:59:59', 'midpeak', 0.708),
(7,  1, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2020分时电价7-9'
(8,  2, '00:00:00', '05:59:59', 'offpeak', 0.345),
(9,  2, '06:00:00', '07:59:59', 'midpeak', 0.708),
(10, 2, '08:00:00', '10:59:59', 'offpeak', 1.159),
(11, 2, '11:00:00', '12:59:59', 'midpeak', 0.708),
(12, 2, '13:00:00', '14:59:59', 'onpeak', 1.159),
(13, 2, '15:00:00', '17:59:59', 'midpeak', 0.708),
(14, 2, '18:00:00', '20:59:59', 'onpeak', 1.159),
(15, 2, '21:00:00', '21:59:59', 'midpeak', 0.708),
(16, 2, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2020分时电价10-12'
(17, 3, '00:00:00', '05:59:59', 'offpeak', 0.345),
(18, 3, '06:00:00', '07:59:59', 'midpeak', 0.708),
(19, 3, '08:00:00', '10:59:59', 'onpeak', 1.159),
(20, 3, '11:00:00', '17:59:59', 'midpeak', 0.708),
(21, 3, '18:00:00', '20:59:59', 'onpeak', 1.159),
(22, 3, '21:00:00', '21:59:59', 'midpeak', 0.708),
(23, 3, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021分时电价1-6'
(24, 4, '00:00:00', '05:59:59', 'offpeak', 0.345),
(25, 4, '06:00:00', '07:59:59', 'midpeak', 0.708),
(26, 4, '08:00:00', '10:59:59', 'onpeak', 1.159),
(27, 4, '11:00:00', '17:59:59', 'midpeak', 0.708),
(28, 4, '18:00:00', '20:59:59', 'onpeak', 1.159),
(29, 4, '21:00:00', '21:59:59', 'midpeak', 0.708),
(30, 4, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021分时电价7-9'
(31, 5, '00:00:00', '05:59:59', 'offpeak', 0.345),
(32, 5, '06:00:00', '07:59:59', 'midpeak', 0.708),
(33, 5, '08:00:00', '10:59:59', 'offpeak', 1.159),
(34, 5, '11:00:00', '12:59:59', 'midpeak', 0.708),
(35, 5, '13:00:00', '14:59:59', 'onpeak', 1.159),
(36, 5, '15:00:00', '17:59:59', 'midpeak', 0.708),
(37, 5, '18:00:00', '20:59:59', 'onpeak', 1.159),
(38, 5, '21:00:00', '21:59:59', 'midpeak', 0.708),
(39, 5, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021分时电价10-12'
(40, 6, '00:00:00', '05:59:59', 'offpeak', 0.345),
(41, 6, '06:00:00', '07:59:59', 'midpeak', 0.708),
(42, 6, '08:00:00', '10:59:59', 'onpeak', 1.159),
(43, 6, '11:00:00', '17:59:59', 'midpeak', 0.708),
(44, 6, '18:00:00', '20:59:59', 'onpeak', 1.159),
(45, 6, '21:00:00', '21:59:59', 'midpeak', 0.708),
(46, 6, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022分时电价1-6'
(47, 7, '00:00:00', '05:59:59', 'offpeak', 0.345),
(48, 7, '06:00:00', '07:59:59', 'midpeak', 0.708),
(49, 7, '08:00:00', '10:59:59', 'onpeak', 1.159),
(50, 7, '11:00:00', '17:59:59', 'midpeak', 0.708),
(51, 7, '18:00:00', '20:59:59', 'onpeak', 1.159),
(52, 7, '21:00:00', '21:59:59', 'midpeak', 0.708),
(53, 7, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022分时电价7-9'
(54, 8, '00:00:00', '05:59:59', 'offpeak', 0.345),
(55, 8, '06:00:00', '07:59:59', 'midpeak', 0.708),
(56, 8, '08:00:00', '10:59:59', 'offpeak', 1.159),
(57, 8, '11:00:00', '12:59:59', 'midpeak', 0.708),
(58, 8, '13:00:00', '14:59:59', 'onpeak', 1.159),
(59, 8, '15:00:00', '17:59:59', 'midpeak', 0.708),
(60, 8, '18:00:00', '20:59:59', 'onpeak', 1.159),
(61, 8, '21:00:00', '21:59:59', 'midpeak', 0.708),
(62, 8, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022分时电价10-12'
(63, 9, '00:00:00', '05:59:59', 'offpeak', 0.345),
(64, 9, '06:00:00', '07:59:59', 'midpeak', 0.708),
(65, 9, '08:00:00', '10:59:59', 'onpeak', 1.159),
(66, 9, '11:00:00', '17:59:59', 'midpeak', 0.708),
(67, 9, '18:00:00', '20:59:59', 'onpeak', 1.159),
(68, 9, '21:00:00', '21:59:59', 'midpeak', 0.708),
(69, 9, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023分时电价1-6'
(70, 10, '00:00:00', '05:59:59', 'offpeak', 0.345),
(71, 10, '06:00:00', '07:59:59', 'midpeak', 0.708),
(72, 10, '08:00:00', '10:59:59', 'onpeak', 1.159),
(73, 10, '11:00:00', '17:59:59', 'midpeak', 0.708),
(74, 10, '18:00:00', '20:59:59', 'onpeak', 1.159),
(75, 10, '21:00:00', '21:59:59', 'midpeak', 0.708),
(76, 10, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023分时电价7-9'
(77, 11, '00:00:00', '05:59:59', 'offpeak', 0.345),
(78, 11, '06:00:00', '07:59:59', 'midpeak', 0.708),
(79, 11, '08:00:00', '10:59:59', 'offpeak', 1.159),
(80, 11, '11:00:00', '12:59:59', 'midpeak', 0.708),
(81, 11, '13:00:00', '14:59:59', 'onpeak', 1.159),
(82, 11, '15:00:00', '17:59:59', 'midpeak', 0.708),
(83, 11, '18:00:00', '20:59:59', 'onpeak', 1.159),
(84, 11, '21:00:00', '21:59:59', 'midpeak', 0.708),
(85, 11, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023分时电价10-12'
(86, 12, '00:00:00', '05:59:59', 'offpeak', 0.345),
(87, 12, '06:00:00', '07:59:59', 'midpeak', 0.708),
(88, 12, '08:00:00', '10:59:59', 'onpeak', 1.159),
(89, 12, '11:00:00', '17:59:59', 'midpeak', 0.708),
(90, 12, '18:00:00', '20:59:59', 'onpeak', 1.159),
(91, 12, '21:00:00', '21:59:59', 'midpeak', 0.708),
(92, 12, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '自来水'
-- 'Water'
(93, 13, '00:00:00', '23:59:59', 'midpeak', 5.95),
-- '天然气'
-- 'Natual Gas'
(94, 14, '00:00:00', '23:59:59', 'midpeak', 3.50);
COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tariffs_blocks`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs_blocks` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tariffs_blocks` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tariff_id` BIGINT NOT NULL,
  `start_amount` DECIMAL(18, 3) NOT NULL,
  `end_amount` DECIMAL(18, 3) NOT NULL,
  `price` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tariffs_blocks_index_1` ON  `myems_system_db`.`tbl_tariffs_blocks`   (`tariff_id`, `start_amount`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tariffs_blocks`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tariffs_blocks`
(`id`, `tariff_id`, `start_amount`, `end_amount`, `price`)
VALUES
-- '分量阶梯电价'
-- 'Block tariff of electrical'
(1, 15, 0, 10000, 0.345),
(2, 15, 10000, 30000, 0.456),
(3, 15, 30000, 100000, 0.567),
(4, 15, 100000, 1000000000, 0.678);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `area` DECIMAL(18, 3) NOT NULL,
  `store_type_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_index_1` ON  `myems_system_db`.`tbl_stores`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_stores`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_stores`
(`id`, `name`, `uuid`, `address`, `latitude`, `longitude`, `area`, `store_type_id`, `is_input_counted`, `contact_id`, `cost_center_id`, `description`)
VALUES
    (1, '麦当劳(祈年大街得来速店)', 'd8a24322-4bab-4ba2-aedc-5d55a84c3db8', '北京市东城区东打磨厂街7号', 39.899493, 116.412041, 500.000, 1, true, 1, 1,  'MacDonald\'s');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_store_types`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_store_types` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_store_types` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `simplified_code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_store_types_index_1` ON  `myems_system_db`.`tbl_store_types`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_store_types`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_store_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, 'Restaurant', '494d7d5e-e139-4629-b957-99ea4caf0401', '餐饮', 'RS'),
(2, 'Retail', '1f556579-9d5c-45ce-9bd8-f2dc1d033470', '零售', 'RT'),
(3, 'Hotel', 'cae697aa-ceca-435d-91bf-492b46607eb0', '酒店', 'HT');


COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_stores_meters_index_1` ON  `myems_system_db`.`tbl_stores_meters`   (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_stores_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_stores_meters`
-- (`id`, `store_id`, `meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_stores_offline_meters_index_1` ON  `myems_system_db`.`tbl_stores_offline_meters`   (`store_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_stores_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_stores_offline_meters`
-- (`id`, `store_id`, `offline_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_points_index_1` ON  `myems_system_db`.`tbl_stores_points`   (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_stores_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_stores_points`
-- (`id`, store_id`, `point_id`)
-- VALUES
-- (1, 3, 2000001),
-- (2, 3, 2000002),
-- (3, 3, 2000003),
-- (4, 3, 2000006);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_sensors_index_1` ON  `myems_system_db`.`tbl_stores_sensors`   (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_stores_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_stores_sensors`
-- (`id`, `store_id`, `sensor_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_virtual_meters_index_1` ON  `myems_system_db`.`tbl_stores_virtual_meters`   (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_stores_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_stores_virtual_meters`
-- (`id`, `store_id`, `virtual_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `buildings` VARCHAR(255) NOT NULL,
  `floors` VARCHAR(255) NOT NULL,
  `rooms` VARCHAR(255) NOT NULL,
  `area` DECIMAL(18, 3) NOT NULL,
  `tenant_type_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_key_tenant` BOOL NOT NULL,
  `lease_number` VARCHAR(255) NOT NULL,
  `lease_start_datetime_utc` DATETIME NOT NULL,
  `lease_end_datetime_utc` DATETIME NOT NULL,
  `is_in_lease` BOOL NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_index_1` ON  `myems_system_db`.`tbl_tenants`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenants`
(`id`, `name`, `uuid`, `buildings`, `floors`, `rooms`, `area`, `tenant_type_id`, `is_input_counted`, `is_key_tenant`,
   `lease_number`, `lease_start_datetime_utc`, `lease_end_datetime_utc`, `is_in_lease`, `contact_id`, `cost_center_id`, `description`)
VALUES
    (1, 'Starbucks星巴克', '6b0da806-a4cd-431a-8116-2915e90aaf8b', 'Building #1', 'L1 L2 L3', '1201b+2247+3F', 418.8, 9, true, true,
       '6b0da806',  '2019-12-31 16:00:00', '2022-12-31 16:00:00', true, 1, 1,  'my description');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenant_types`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenant_types` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenant_types` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `simplified_code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenant_types_index_1` ON  `myems_system_db`.`tbl_tenant_types`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tenant_types`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenant_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, '餐饮租户', '83fffba1-9e22-4397-a93a-3742772c3753', 'Food and Beverage', 'FNB'),
(2, '燃气餐饮租户', 'ad95ed16-1c57-49a9-a85e-71e389393089', 'Food and Beverage (Gas)', 'FNBGas'),
(3, '电餐饮租户', '1dc21e83-4333-40f8-9e25-ea049becba37', 'Food and Beverage (Electrical)', 'FNBElec'),
(4, '高照度租户', '4208a60d-d8e6-4fe5-8cea-a55109e9b397', 'High Illuminance Tenant', 'HighIllu'),
(5, '主力租户', 'fc4ae534-544a-4a22-b83b-9f4aa99494aa', 'Anchor Tenant', 'ANCH'),
(6, '普通商业租户', '6d1dca30-1cbe-463d-8a78-cdd5e0f8ac8b', 'Normal Tenant', 'Normal'),
(7, '其他商业租户', '2078e1c0-3936-4ae7-9253-08e0aa1d84b6', 'Other Retail Tenants', 'Other'),
(8, '整层办公租户', 'b2a580a3-edc9-4838-ae1d-7b7265860a9a', 'Whole Floor Office Tenant', 'WhFlr'),
(9, '非整层办公租户', '55bbcba7-d8a0-44a0-9a9f-2f085e3cb044', 'None-Whole Floor Office Tenant', 'NonWhFlr');


COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_tenants_meters_index_1` ON  `myems_system_db`.`tbl_tenants_meters`   (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tenants_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_tenants_meters`
-- (`id`, `tenant_id`, `meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_tenants_offline_meters_index_1` ON  `myems_system_db`.`tbl_tenants_offline_meters`   (`tenant_id`);
-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tenants_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_tenants_offline_meters`
-- (`id`, `tenant_id`, `offline_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_points_index_1` ON  `myems_system_db`.`tbl_tenants_points`   (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tenants_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_tenants_points`
-- (`id`, tenant_id`, `point_id`)
-- VALUES
-- (1, 3, 2000001),
-- (2, 3, 2000002),
-- (3, 3, 2000003),
-- (4, 3, 2000006);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_sensors_index_1` ON  `myems_system_db`.`tbl_tenants_sensors`   (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tenants_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_tenants_sensors`
-- (`id`, `tenant_id`, `sensor_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_virtual_meters_index_1` ON  `myems_system_db`.`tbl_tenants_virtual_meters`   (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_tenants_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_tenants_virtual_meters`
-- (`id`, `tenant_id`, `virtual_meter_id`)
-- VALUES
-- (1, 1, 1);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_timezones`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_timezones` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_timezones` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(64) NOT NULL,
  `utc_offset` VARCHAR(8) NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Data for table `myems_system_db`.`tbl_timezones`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_timezones`
(`id`, `name`, `description`, `utc_offset`)
VALUES
(1, 'Dateline Standard Time', '(GMT-12:00) International Date Line West', '-12:00'),
(2, 'Samoa Standard Time', '(GMT-11:00) Midway Island, Samoa', '-11:00'),
(3, 'Hawaiian Standard Time', '(GMT-10:00) Hawaii', '-10:00'),
(4, 'Alaskan Standard Time', '(GMT-09:00) Alaska', '-09:00'),
(5, 'Pacific Standard Time', '(GMT-08:00) Pacific Time (US and Canada) Tijuana', '-08:00'),
(6, 'Mountain Standard Time', '(GMT-07:00) Mountain Time (US and Canada)', '-07:00'),
(7, 'Mexico Standard Time 2', '(GMT-07:00) Chihuahua, La Paz, Mazatlan', '-07:00'),
(8, 'U.S. Mountain Standard Time', '(GMT-07:00) Arizona', '-07:00'),
(9, 'Central Standard Time', '(GMT-06:00) Central Time (US and Canada)', '-06:00'),
(10, 'Canada Central Standard Time', '(GMT-06:00) Saskatchewan', '-06:00'),
(11, 'Mexico Standard Time', '(GMT-06:00) Guadalajara, Mexico City, Monterrey', '-06:00'),
(12, 'Central America Standard Time', '(GMT-06:00) Central America', '-06:00'),
(13, 'Eastern Standard Time', '(GMT-05:00) Eastern Time (US and Canada)', '-05:00'),
(14, 'U.S. Eastern Standard Time', '(GMT-05:00) Indiana (East)', '-05:00'),
(15, 'S.A. Pacific Standard Time', '(GMT-05:00) Bogota, Lima, Quito', '-05:00'),
(16, 'Atlantic Standard Time', '(GMT-04:00) Atlantic Time (Canada)', '-04:00'),
(17, 'S.A. Western Standard Time', '(GMT-04:00) Georgetown, La Paz, San Juan', '-04:00'),
(18, 'Pacific S.A. Standard Time', '(GMT-04:00) Santiago', '-04:00'),
(19, 'Newfoundland and Labrador Standard Time', '(GMT-03:30) Newfoundland', '-03:30'),
(20, 'E. South America Standard Time', '(GMT-03:00) Brasilia', '-03:00'),
(21, 'S.A. Eastern Standard Time', '(GMT-03:00) Georgetown', '-03:00'),
(22, 'Greenland Standard Time', '(GMT-03:00) Greenland', '-03:00'),
(23, 'Mid-Atlantic Standard Time', '(GMT-02:00) Mid-Atlantic', '-02:00'),
(24, 'Azores Standard Time', '(GMT-01:00) Azores', '-01:00'),
(25, 'Cape Verde Standard Time', '(GMT-01:00) Cape Verde Islands', '-01:00'),
(26, 'GMT Standard Time', '(GMT) Greenwich Mean Time: Dublin, Edinburgh, Lisbon, London', '+00:00'),
(27, 'Greenwich Standard Time', '(GMT) Monrovia, Reykjavik', '+00:00'),
(28, 'Central Europe Standard Time', '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague', '+01:00'),
(29, 'Central European Standard Time', '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb', '+01:00'),
(30, 'Romance Standard Time', '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris', '+01:00'),
(31, 'W. Europe Standard Time', '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna', '+01:00'),
(32, 'W. Central Africa Standard Time', '(GMT+01:00) West Central Africa', '+01:00'),
(33, 'E. Europe Standard Time', '(GMT+02:00) Minsk', '+02:00'),
(34, 'Egypt Standard Time', '(GMT+02:00) Cairo', '+02:00'),
(35, 'FLE Standard Time', '(GMT+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius', '+02:00'),
(36, 'GTB Standard Time', '(GMT+02:00) Athens, Bucharest, Istanbul', '+02:00'),
(37, 'Israel Standard Time', '(GMT+02:00) Jerusalem', '+02:00'),
(38, 'South Africa Standard Time', '(GMT+02:00) Harare, Pretoria', '+02:00'),
(39, 'Russian Standard Time', '(GMT+03:00) Moscow, St. Petersburg, Volgograd', '+03:00'),
(40, 'Arab Standard Time', '(GMT+03:00) Kuwait, Riyadh', '+03:00'),
(41, 'E. Africa Standard Time', '(GMT+03:00) Nairobi', '+03:00'),
(42, 'Arabic Standard Time', '(GMT+03:00) Baghdad', '+03:00'),
(43, 'Iran Standard Time', '(GMT+03:30) Tehran', '+03:30'),
(44, 'Arabian Standard Time', '(GMT+04:00) Abu Dhabi, Muscat', '+04:00'),
(45, 'Caucasus Standard Time', '(GMT+04:00) Baku, Tbilisi, Yerevan', '+04:00'),
(46, 'Transitional Islamic State of Afghanistan Standard Time', '(GMT+04:30) Kabul', '+04:30'),
(47, 'Ekaterinburg Standard Time', '(GMT+05:00) Ekaterinburg', '+05:00'),
(48, 'West Asia Standard Time', '(GMT+05:00) Tashkent', '+05:00'),
(49, 'India Standard Time', '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi', '+05:30'),
(50, 'Central Asia Standard Time', '(GMT+06:00) Astana, Dhaka', '+06:00'),
(51, 'Sri Lanka Standard Time', '(GMT+06:00) Sri Jayawardenepura', '+06:00'),
(52, 'N. Central Asia Standard Time', '(GMT+06:00) Almaty, Novosibirsk', '+06:00'),
(53, 'Myanmar Standard Time', '(GMT+06:30) Yangon (Rangoon)', '+06:30'),
(54, 'S.E. Asia Standard Time', '(GMT+07:00) Bangkok, Hanoi, Jakarta', '+07:00'),
(55, 'North Asia Standard Time', '(GMT+07:00) Krasnoyarsk', '+07:00'),
(56, 'China Standard Time', '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi', '+08:00'),
(57, 'Singapore Standard Time', '(GMT+08:00) Kuala Lumpur, Singapore', '+08:00'),
(58, 'Taipei Standard Time', '(GMT+08:00) Taipei', '+08:00'),
(59, 'W. Australia Standard Time', '(GMT+08:00) Perth', '+08:00'),
(60, 'North Asia East Standard Time', '(GMT+08:00) Irkutsk, Ulaanbaatar', '+08:00'),
(61, 'Korea Standard Time', '(GMT+09:00) Seoul', '+09:00'),
(62, 'Tokyo Standard Time', '(GMT+09:00) Osaka, Sapporo, Tokyo', '+09:00'),
(63, 'Yakutsk Standard Time', '(GMT+09:00) Yakutsk', '+09:00'),
(64, 'A.U.S. Central Standard Time', '(GMT+09:30) Darwin', '+09:30'),
(65, 'Cen. Australia Standard Time', '(GMT+09:30) Adelaide', '+09:30'),
(66, 'A.U.S. Eastern Standard Time', '(GMT+10:00) Canberra, Melbourne, Sydney', '+10:00'),
(67, 'E. Australia Standard Time', '(GMT+10:00) Brisbane', '+10:00'),
(68, 'Tasmania Standard Time', '(GMT+10:00) Hobart', '+10:00'),
(69, 'Vladivostok Standard Time', '(GMT+10:00) Vladivostok', '+10:00'),
(70, 'West Pacific Standard Time', '(GMT+10:00) Guam, Port Moresby', '+10:00'),
(71, 'Central Pacific Standard Time', '(GMT+11:00) Magadan, Solomon Islands, New Caledonia', '+11:00'),
(72, 'Fiji Islands Standard Time', '(GMT+12:00) Fiji, Kamchatka, Marshall Is.', '+12:00'),
(73, 'New Zealand Standard Time', '(GMT+12:00) Auckland, Wellington', '+12:00'),
(74, 'Tonga Standard Time', '(GMT+13:00) Nuku\'alofa', '+13:00'),
(75, 'Azerbaijan Standard Time', '(GMT-03:00) Buenos Aires', '-03:00'),
(76, 'Middle East Standard Time', '(GMT+02:00) Beirut', '+02:00'),
(77, 'Jordan Standard Time', '(GMT+02:00) Amman', '+02:00'),
(78, 'Central Standard Time (Mexico)', '(GMT-06:00) Guadalajara, Mexico City, Monterrey - New', '-06:00'),
(79, 'Mountain Standard Time (Mexico)', '(GMT-07:00) Chihuahua, La Paz, Mazatlan - New', '-07:00'),
(80, 'Pacific Standard Time (Mexico)', '(GMT-08:00) Tijuana, Baja California', '-08:00'),
(81, 'Namibia Standard Time', '(GMT+02:00) Windhoek', '+02:00'),
(82, 'Georgian Standard Time', '(GMT+03:00) Tbilisi', '+03:00'),
(83, 'Central Brazilian Standard Time', '(GMT-04:00) Manaus', '-04:00'),
(84, 'Montevideo Standard Time', '(GMT-03:00) Montevideo', '-03:00'),
(85, 'Armenian Standard Time', '(GMT+04:00) Yerevan', '+04:00'),
(86, 'Venezuela Standard Time', '(GMT-04:30) Caracas', '-04:30'),
(87, 'Argentina Standard Time', '(GMT-03:00) Buenos Aires', '-03:00'),
(88, 'Morocco Standard Time', '(GMT) Casablanca', '+00:00'),
(89, 'Pakistan Standard Time', '(GMT+05:00) Islamabad, Karachi', '+05:00'),
(90, 'Mauritius Standard Time', '(GMT+04:00) Port Louis', '+04:00'),
(91, 'UTC', '(GMT) Coordinated Universal Time', '+00:00'),
(92, 'Paraguay Standard Time', '(GMT-04:00) Asuncion', '-04:00'),
(93, 'Kamchatka Standard Time', '(GMT+12:00) Petropavlovsk-Kamchatsky', '+12:00');

COMMIT;
-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_meters_index_1` ON  `myems_system_db`.`tbl_virtual_meters`   (`name`);
CREATE INDEX `tbl_virtual_meters_index_2` ON  `myems_system_db`.`tbl_virtual_meters`   (`energy_category_id`);
CREATE INDEX `tbl_virtual_meters_index_3` ON  `myems_system_db`.`tbl_virtual_meters`   (`energy_item_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;

-- INSERT INTO `myems_system_db`.`tbl_virtual_meters`
-- (`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `cost_center_id`, `energy_item_id`, `description`)
-- VALUES
-- (1, '示例虚拟表', '3fff2cfb-f755-44c8-a919-6135205a8573', 1, true, 1, 1, `virtual description`);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_variables`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_variables` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_variables` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` CHAR(36) NOT NULL,
  `expression_id` BIGINT NOT NULL,
  `meter_type` VARCHAR(32) NOT NULL COMMENT 'meter, virtual_meter, offline_meter',
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_variables_index_1` ON  `myems_system_db`.`tbl_variables`   (`expression_id`);
  CREATE INDEX `tbl_variables_index_2` ON  `myems_system_db`.`tbl_variables`   (`meter_id`, `meter_type`, `expression_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_variables`
-- ---------------------------------------------------------------------------------------------------------------------
-- START TRANSACTION;
-- USE `myems_system_db`;
-- -- id 1
-- -- meter_type = {'meter', 'virtual_meter', 'offline_meter'}
-- --
-- INSERT INTO `myems_system_db`.`tbl_variables`
-- (`id`, `name`, `expression_id`, `meter_type`, `meter_id`)
-- VALUES
-- (1, 'x', 1, 'meter', 1),
-- (2, 'y', 1, 'meter', 2),
-- (3, 'z', 1, 'meter', 3);

-- COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_versions` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_versions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `version` VARCHAR(256) NOT NULL,
  `release_date` DATE NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Example Data for table `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_versions`
(`id`, `version`, `release_date`)
VALUES
(1, '1.0.2', '2021-01-29');

COMMIT;
