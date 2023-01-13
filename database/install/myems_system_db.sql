-- MyEMS System Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_system_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_system_db` ;
CREATE DATABASE IF NOT EXISTS `myems_system_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;
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
-- Table `myems_system_db`.`tbl_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_data_sources` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `gateway_id` BIGINT NOT NULL,
  `protocol` VARCHAR(16) NOT NULL,
  `connection` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `last_seen_datetime_utc` DATETIME NULL  COMMENT 'The last seen date time in UTC via PING or TELNET',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_data_sources_index_1` ON  `myems_system_db`.`tbl_data_sources`   (`name`);
CREATE INDEX `tbl_data_sources_index_2` ON  `myems_system_db`.`tbl_data_sources`   (`gateway_id`);
CREATE INDEX `tbl_data_sources_index_3` ON  `myems_system_db`.`tbl_data_sources`   (`protocol`);

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
-- Table `myems_system_db`.`tbl_gateways`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_gateways` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_gateways` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `token` CHAR(36) NOT NULL,
  `last_seen_datetime_utc` DATETIME NULL  COMMENT 'The last seen date time in UTC via PING, TELNET or Heartbeat',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_gateways_index_1` ON  `myems_system_db`.`tbl_gateways`   (`name`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Default Data for table `myems_system_db`.`tbl_gateways`
-- This gateway's token is used by myems-modbus-tcp service
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_gateways`
(`id`, `name`, `uuid`, `token`,  `last_seen_datetime_utc`)
VALUES
(1, 'Gateway1', 'dc681938-5053-8660-98ed-266c58227231', '983427af-1c35-42ba-8b4d-288675550225', null);

COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_integrators`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_integrators` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_integrators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `high_temperature_point_id` BIGINT NOT NULL,
  `low_temperature_point_id` BIGINT NOT NULL,
  `flow_point_id` BIGINT NOT NULL,
  `heat_capacity` DECIMAL(18, 3) NOT NULL,
  `liquid_density` DECIMAL(18, 3) NOT NULL,
  `coefficient` DECIMAL(18, 3) NOT NULL,
  `result_point_id` BIGINT NOT NULL,
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_integrators_index_1` ON `myems_system_db`.`tbl_integrators` (`name`);



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
-- Table `myems_system_db`.`tbl_menus`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_menus` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_menus` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `route` VARCHAR(256) NOT NULL,
  `parent_menu_id` BIGINT,
  `is_hidden` BOOL NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(100,'Space Data','/space',NULL,0),
(101,'Energy Category Data','/space/energycategory',100,0),
(102,'Energy Item Data','/space/energyitem',100,0),
(103,'Cost','/space/cost',100,0),
(104,'Output','/space/output',100,0),
(105,'Income','/space/income',100,0),
(106,'Efficiency','/space/efficiency',100,0),
(107,'Load','/space/load',100,0),
(108,'Statistics','/space/statistics',100,0),
(109,'Saving','/space/saving',100,0),
(110,'Carbon','/space/carbon',100,0),
(200,'Equipment Data','/equipment',NULL,0),
(201,'Energy Category Data','/equipment/energycategory',200,0),
(202,'Energy Item Data','/equipment/energyitem',200,0),
(203,'Cost','/equipment/cost',200,0),
(204,'Output','/equipment/output',200,0),
(205,'Income','/equipment/income',200,0),
(206,'Efficiency','/equipment/efficiency',200,0),
(207,'Load','/equipment/load',200,0),
(208,'Statistics','/equipment/statistics',200,0),
(209,'Saving','/equipment/saving',200,0),
(210,'Batch Analysis','/equipment/batch',200,0),
(211,'Equipment Tracking','/equipment/tracking',200,0),
(212,'Carbon','/equipment/carbon',200,0),
(300,'Meter Data','/meter',NULL,0),
(301,'Meter Energy','/meter/meterenergy',300,0),
(302,'Meter Cost','/meter/metercost',300,0),
(303,'Meter Trend','/meter/metertrend',300,0),
(304,'Meter Realtime','/meter/meterrealtime',300,0),
(305,'Master Meter Submeters Balance','/meter/metersubmetersbalance',300,0),
(306,'Virtual Meter Energy','/meter/virtualmeterenergy',300,0),
(307,'Virtual Meter Cost','/meter/virtualmetercost',300,0),
(308,'Offline Meter Energy','/meter/offlinemeterenergy',300,0),
(309,'Offline Meter Cost','/meter/offlinemetercost',300,0),
(310,'Meter Batch Analysis','/meter/meterbatch',300,0),
(311,'Meter Tracking','/meter/metertracking',300,0),
(312,'Meter Carbon','/meter/metercarbon',300,0),
(313,'Virtual Meter Carbon','/meter/virtualmetercarbon',300,0),
(314,'Virtual Meter Batch Analysis','/meter/virtualmeterbatch',300,0),
(315,'Offline Meter Batch Analysis','/meter/offlinemeterbatch',300,0),
(316,'Offline Meter Carbon','/meter/offlinemetercarbon',300,0),
(317,'Meter Saving','/meter/metersaving',300,0),
(318,'Offline Meter Saving','/meter/offlinemetersaving',300,0),
(319,'Virtual Meter Saving','/meter/virtualmetersaving',300,0),
(320,'Meter Comparison','/meter/metercomparison',300,0),
(400,'Tenant Data','/tenant',NULL,0),
(401,'Energy Category Data','/tenant/energycategory',400,0),
(402,'Energy Item Data','/tenant/energyitem',400,0),
(403,'Cost','/tenant/cost',400,0),
(404,'Load','/tenant/load',400,0),
(405,'Statistics','/tenant/statistics',400,0),
(406,'Saving','/tenant/saving',400,0),
(407,'Tenant Bill','/tenant/bill',400,0),
(408,'Batch Analysis','/tenant/batch',400,0),
(409,'Carbon','/tenant/carbon',400,0),
(500,'Store Data','/store',NULL,0),
(501,'Energy Category Data','/store/energycategory',500,0),
(502,'Energy Item Data','/store/energyitem',500,0),
(503,'Cost','/store/cost',500,0),
(504,'Load','/store/load',500,0),
(505,'Statistics','/store/statistics',500,0),
(506,'Saving','/store/saving',500,0),
(507,'Batch Analysis','/store/batch',500,0),
(508,'Carbon','/store/carbon',500,0),
(600,'Shopfloor Data','/shopfloor',NULL,0),
(601,'Energy Category Data','/shopfloor/energycategory',600,0),
(602,'Energy Item Data','/shopfloor/energyitem',600,0),
(603,'Cost','/shopfloor/cost',600,0),
(604,'Load','/shopfloor/load',600,0),
(605,'Statistics','/shopfloor/statistics',600,0),
(606,'Saving','/shopfloor/saving',600,0),
(607,'Batch Analysis','/shopfloor/batch',600,0),
(608,'Carbon','/shopfloor/carbon',600,0),
(700,'Combined Equipment Data','/combinedequipment',NULL,0),
(701,'Energy Category Data','/combinedequipment/energycategory',700,0),
(702,'Energy Item Data','/combinedequipment/energyitem',700,0),
(703,'Cost','/combinedequipment/cost',700,0),
(704,'Output','/combinedequipment/output',700,0),
(705,'Income','/combinedequipment/income',700,0),
(706,'Efficiency','/combinedequipment/efficiency',700,0),
(707,'Load','/combinedequipment/load',700,0),
(708,'Statistics','/combinedequipment/statistics',700,0),
(709,'Saving','/combinedequipment/saving',700,0),
(710,'Batch Analysis','/combinedequipment/batch',700,0),
(711,'Carbon','/combinedequipment/carbon',700,0),
(800,'Auxiliary System','/auxiliarysystem',NULL,0),
(801,'Energy Flow Diagram','/auxiliarysystem/energyflowdiagram',800,0),
(802,'Distribution System','/auxiliarysystem/distributionsystem',800,0),
(900,'Fault Detection & Diagnostics','/fdd',NULL,0),
(1000,'Monitoring','/monitoring',NULL,0),
(1001,'Space Equipments','/monitoring/spaceequipments',1000,0),
(1002,'Combined Equipments','/monitoring/combinedequipments',1000,0),
(1003,'Tenant Equipments','/monitoring/tenantequipments',1000,0),
(1004,'Store Equipments','/monitoring/storeequipments',1000,0),
(1005,'Shopfloor Equipments','/monitoring/shopfloorequipments',1000,0),
(1100,'Advanced Reporting','/advancedreporting',NULL,0),
(1200,'Knowledge Base','/knowledgebase',NULL,0);

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
-- Table `myems_system_db`.`tbl_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `is_counted` BOOL NOT NULL,
  `hourly_low_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Default is 0.',
  `hourly_high_limit` DECIMAL(18, 3)  NOT NULL COMMENT 'Inclusive. Maximum energy consumption per hour.',
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meters_index_1` ON  `myems_system_db`.`tbl_offline_meters`   (`name`);
CREATE INDEX `tbl_offline_meters_index_2` ON  `myems_system_db`.`tbl_offline_meters`   (`energy_category_id`);
CREATE INDEX `tbl_offline_meters_index_3` ON  `myems_system_db`.`tbl_offline_meters`   (`energy_item_id`);

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
  `low_limit` DECIMAL(18, 3) NOT NULL ,
  `ratio` DECIMAL(18, 3) DEFAULT 1.000 NOT NULL,
  `is_trend` BOOL NOT NULL,
  `is_virtual` BOOL DEFAULT FALSE NOT NULL,
  `address` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_points_index_1` ON  `myems_system_db`.`tbl_points`   (`name`);
CREATE INDEX `tbl_points_index_2` ON  `myems_system_db`.`tbl_points`   (`data_source_id`);
CREATE INDEX `tbl_points_index_3` ON  `myems_system_db`.`tbl_points`   (`id`, `object_type`);

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
-- Default Data for table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces`
(`id`, `name`, `uuid`, `parent_space_id`, `area`, `timezone_id`, `contact_id`, `is_input_counted`, `is_output_counted`, `cost_center_id`, `description`)
VALUES
-- DO NOT deleted the record which ID is 1. It's the root space.
(1, 'MyEMS Headquarter', '9dfb7cff-f19f-4a1e-8c79-3adf6425bfd9', NULL, 99999.999, 56, 1, true, true, 1,  'MyEMS Project');
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
-- Table `myems_system_db`.`tbl_spaces_non_working_days`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_non_working_days` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_non_working_days` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `date_local` DATE NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_non_working_days_index_1` ON  `myems_system_db`.`tbl_spaces_non_working_days`  (`space_id`, `date_local`);

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
CREATE INDEX `tbl_tariffs_index_1` ON  `myems_system_db`.`tbl_tariffs`   (`name`);
CREATE INDEX `tbl_tariffs_index_2` ON  `myems_system_db`.`tbl_tariffs`   (`energy_category_id`, `valid_from_datetime_utc`,  `valid_through_datetime_utc`);

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
  `equation` LONGTEXT NOT NULL,
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
-- Table `myems_system_db`.`tbl_variables`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_variables` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_variables` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` CHAR(36) NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  `meter_type` VARCHAR(32) NOT NULL COMMENT 'meter, virtual_meter, offline_meter',
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_variables_index_1` ON  `myems_system_db`.`tbl_variables`   (`virtual_meter_id`);
  CREATE INDEX `tbl_variables_index_2` ON  `myems_system_db`.`tbl_variables`   (`meter_id`, `meter_type`, `virtual_meter_id`);

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
-- Data for table `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_versions`
(`id`, `version`, `release_date`)
VALUES
(1, '2.12.0', '2023-01-16');

COMMIT;
