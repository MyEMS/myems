-- MyEMS System Database

-- ---------------------------------------------------------------------------------------------------------------------
-- Schema myems_system_db
-- ---------------------------------------------------------------------------------------------------------------------
DROP DATABASE IF EXISTS `myems_system_db` ;
CREATE DATABASE IF NOT EXISTS `myems_system_db` CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' ;


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_charging_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_charging_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_charging_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12, 10) NOT NULL,
  `longitude` DECIMAL(13, 10) NOT NULL,
  `latitude_point_id` BIGINT,
  `longitude_point_id` BIGINT,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `svg2_id` BIGINT,
  `svg3_id` BIGINT,
  `svg4_id` BIGINT,
  `svg5_id` BIGINT,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `commissioning_date` DATE,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_charging_stations_index_1` ON `myems_system_db`.`tbl_charging_stations` (`name`);

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
  `svg_id` BIGINT,
  `camera_url` VARCHAR(1000),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_index_1` ON `myems_system_db`.`tbl_combined_equipments` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_comands_index_1` ON `myems_system_db`.`tbl_combined_equipments_commands` (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_equipments_index_1` ON `myems_system_db`.`tbl_combined_equipments_equipments` (`combined_equipment_id`);


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
CREATE INDEX `tbl_combined_equipments_meters_index_1` ON `myems_system_db`.`tbl_combined_equipments_meters` (`combined_equipment_id`);


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
CREATE INDEX `tbl_combined_equipments_offline_meters_index_1` ON `myems_system_db`.`tbl_combined_equipments_offline_meters` (`combined_equipment_id`);


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
CREATE INDEX `tbl_combined_equipment_parameters_index_1` ON `myems_system_db`.`tbl_combined_equipments_parameters` (`combined_equipment_id`);

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
CREATE INDEX `tbl_combined_equipments_virtual_meters_index_1` ON `myems_system_db`.`tbl_combined_equipments_virtual_meters` (`combined_equipment_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `set_value` DECIMAL(21, 6) NULL COMMENT 'If not null, the $s1 in payload will be replaced with this value',
  `description` VARCHAR(255) ,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_commands_index_1` ON `myems_system_db`.`tbl_commands` (`name`);


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
-- Table `myems_system_db`.`tbl_control_modes`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_control_modes` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_control_modes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `is_active` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_control_modes_index_1` ON `myems_system_db`.`tbl_control_modes` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_control_modes_times`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_control_modes_times` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_control_modes_times` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `control_mode_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `power_value` DECIMAL(21, 6),
  `power_point_id` BIGINT,
  `power_equation` LONGTEXT COMMENT 'MUST be in json format or NULL',
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_control_modes_times_index_1` ON `myems_system_db`.`tbl_control_modes_times` (`control_mode_id`);

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
CREATE INDEX `tbl_cost_centers_index_1` ON `myems_system_db`.`tbl_cost_centers` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_cost_centers_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_cost_centers_tariffs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_cost_centers_tariffs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cost_center_id` BIGINT NOT NULL,
  `tariff_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_cost_centers_tariffs_index_1` ON `myems_system_db`.`tbl_cost_centers_tariffs` (`cost_center_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_data_sources` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `gateway_id` BIGINT NOT NULL,
  `protocol` VARCHAR(128) NOT NULL,
  `connection` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `process_id` BIGINT,
  `last_seen_datetime_utc` DATETIME NULL  COMMENT 'The last seen date time in UTC via PING or TELNET',
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_data_sources_index_1` ON `myems_system_db`.`tbl_data_sources` (`name`);
CREATE INDEX `tbl_data_sources_index_2` ON `myems_system_db`.`tbl_data_sources` (`gateway_id`);
CREATE INDEX `tbl_data_sources_index_3` ON `myems_system_db`.`tbl_data_sources` (`protocol`);

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
  `peak_load` DECIMAL(21, 6)  COMMENT '最大容量, 设备容量(KW)',
  `peak_current` DECIMAL(21, 6) COMMENT '最大电流, 计算电流(A)',
  `customers` VARCHAR(255) COMMENT '用电设备, 用户',
  `meters` VARCHAR(255) COMMENT '出线电表, 下级电表',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_circuits_index_1`
ON `myems_system_db`.`tbl_distribution_circuits` (`distribution_system_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_circuits_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_circuits_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_circuits_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `distribution_circuit_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_circuits_points_index_1`
ON `myems_system_db`.`tbl_distribution_circuits_points` (`distribution_circuit_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_distribution_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_distribution_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_distribution_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `svg_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_distribution_systems_index_1` ON `myems_system_db`.`tbl_distribution_systems` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_categories`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_categories` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `unit_of_measure` VARCHAR(32) NOT NULL,
  `kgce` DECIMAL(21, 6) NOT NULL COMMENT 'Kilogram of Coal Equivalent',
  `kgco2e` DECIMAL(21, 6) NOT NULL COMMENT 'Carbon Dioxide Emissions Factor',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_categories_index_1` ON `myems_system_db`.`tbl_energy_categories` (`name`);

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
CREATE INDEX `tbl_energy_items_index_1` ON `myems_system_db`.`tbl_energy_items` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_index_1` ON `myems_system_db`.`tbl_energy_flow_diagrams` (`name`);

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
CREATE INDEX `tbl_energy_flow_diagrams_links_index_1`
ON `myems_system_db`.`tbl_energy_flow_diagrams_links` (`energy_flow_diagram_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_nodes` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_nodes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_flow_diagram_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_nodes_index_1`
ON `myems_system_db`.`tbl_energy_flow_diagrams_nodes` (`energy_flow_diagram_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_index_1` ON `myems_system_db`.`tbl_energy_storage_containers` (`name`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_batteries`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_batteries` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_batteries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `battery_state_point_id` BIGINT NOT NULL,
  `soc_point_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `charge_meter_id` BIGINT NOT NULL,
  `discharge_meter_id` BIGINT NOT NULL,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `nominal_voltage` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_batteries_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_batteries` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_bmses_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_bmses_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_bmses_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_bmses_points` (`bms_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_commands_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_commands` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_data_sources` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `data_source_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_data_sources_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_data_sources` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_dcdcs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_dcdcs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_dcdcs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_dcdcs_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_dcdcs` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_dcdcs_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_dcdcs_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_dcdcs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `dcdc_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_dcdcs_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_dcdcs_points` (`dcdc_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_firecontrols`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_firecontrols` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_firecontrols` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_firecontrols_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_firecontrols` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_firecontrols_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_firecontrols_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_firecontrols_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `firecontrol_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_firecontrols_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_firecontrols_points` (`firecontrol_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_grids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_grids_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_grids` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_grids_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `grid_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_grids_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_grids_points` (`grid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_hvacs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_hvacs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_hvacs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_hvacs_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_hvacs` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_hvacs_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_hvacs_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_hvacs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `hvac_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_hvacs_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_hvacs_points` (`hvac_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_loads`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_loads_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_loads` (`energy_storage_container_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_loads_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_loads_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_loads_points` (`load_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `run_state_point_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_pcs_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_pcses_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_pcses_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_pcses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pcs_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_pcses_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_pcses_points` (`pcs_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_schedules`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_schedules` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_schedules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `peak_type` VARCHAR(8) NOT NULL
  COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep-Valley深谷',
  `power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_schedules_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_schedules` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_stses`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_stses` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_stses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_stses_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_stses` (`energy_storage_container_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_containers_stses_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_containers_stses_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_stses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sts_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_stses_points_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_stses_points` (`sts_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12, 10) NOT NULL,
  `longitude` DECIMAL(13, 10) NOT NULL,
  `latitude_point_id` BIGINT,
  `longitude_point_id` BIGINT,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `svg2_id` BIGINT,
  `svg3_id` BIGINT,
  `svg4_id` BIGINT,
  `svg5_id` BIGINT,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `commissioning_date` DATE,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_index_1`
ON `myems_system_db`.`tbl_energy_storage_power_stations` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations_containers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_containers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_containers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_containers_index_1`
ON `myems_system_db`.`tbl_energy_storage_power_stations_containers` (`energy_storage_power_station_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_users` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_users_index_1`
ON `myems_system_db`.`tbl_energy_storage_power_stations_users` (`energy_storage_power_station_id`);

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
  `svg_id` BIGINT,
  `camera_url` VARCHAR(1000),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_index_1` ON `myems_system_db`.`tbl_equipments` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_comands_index_1` ON `myems_system_db`.`tbl_equipments_commands` (`equipment_id`);

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
CREATE INDEX `tbl_equipments_meters_index_1` ON `myems_system_db`.`tbl_equipments_meters` (`equipment_id`);

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
CREATE INDEX `tbl_equipments_offline_meters_index_1`
ON `myems_system_db`.`tbl_equipments_offline_meters` (`equipment_id`);

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
CREATE INDEX `tbl_equipment_parameters_index_1` ON `myems_system_db`.`tbl_equipments_parameters` (`equipment_id`);

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
CREATE INDEX `tbl_equipments_virtual_meters_index_1`
ON `myems_system_db`.`tbl_equipments_virtual_meters` (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_fuel_integrators`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_fuel_integrators` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_fuel_integrators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `model` VARCHAR(255) NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `result_point_id` BIGINT NOT NULL,
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_fuel_integrators_index_1` ON `myems_system_db`.`tbl_fuel_integrators` (`name`);

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
  `description` VARCHAR(255) ,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_gateways_index_1` ON `myems_system_db`.`tbl_gateways` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Default Data for table `myems_system_db`.`tbl_gateways`
-- This gateway's token is used by myems-modbus-tcp service
-- ---------------------------------------------------------------------------------------------------------------------
INSERT INTO `myems_system_db`.`tbl_gateways`
(`id`, `name`, `uuid`, `token`,  `last_seen_datetime_utc`, `description`)
VALUES
(1, 'Gateway1', 'dc681938-5053-8660-98ed-266c58227231', '983427af-1c35-42ba-8b4d-288675550225', null, null);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_heat_integrators`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_heat_integrators` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_heat_integrators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `high_temperature_point_id` BIGINT NOT NULL,
  `low_temperature_point_id` BIGINT NOT NULL,
  `flow_point_id` BIGINT NOT NULL,
  `heat_capacity` DECIMAL(21, 6) NOT NULL,
  `liquid_density` DECIMAL(21, 6) NOT NULL,
  `coefficient` DECIMAL(21, 6) NOT NULL,
  `result_point_id` BIGINT NOT NULL,
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_heat_integrators_index_1` ON `myems_system_db`.`tbl_heat_integrators` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_iot_sim_cards`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_iot_sim_cards` ;

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
CREATE INDEX `tbl_knowledge_files_index_1` ON `myems_system_db`.`tbl_knowledge_files` (`file_name`);
CREATE INDEX `tbl_knowledge_files_index_2` ON `myems_system_db`.`tbl_knowledge_files` (`upload_datetime_utc`);

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
(109,'Saving','/space/saving',100,1),
(110,'Carbon','/space/carbon',100,0),
(111,'Environment Monitor','/space/environmentmonitor',100,0),
(112,'Plan','/space/plan',100,1),
(113,'Production','/space/production',100,1),
(114,'Enter Production','/space/enterproduction',100,1),
(115,'Prediction','/space/prediction',100,1),
(200,'Equipment Data','/equipment',NULL,0),
(201,'Energy Category Data','/equipment/energycategory',200,0),
(202,'Energy Item Data','/equipment/energyitem',200,0),
(203,'Cost','/equipment/cost',200,0),
(204,'Output','/equipment/output',200,0),
(205,'Income','/equipment/income',200,0),
(206,'Efficiency','/equipment/efficiency',200,0),
(207,'Load','/equipment/load',200,0),
(208,'Statistics','/equipment/statistics',200,0),
(209,'Saving','/equipment/saving',200,1),
(210,'Batch Analysis','/equipment/batch',200,0),
(211,'Equipment Tracking','/equipment/tracking',200,0),
(212,'Carbon','/equipment/carbon',200,0),
(213,'Plan','/equipment/plan',200,1),
(214,'Equipment Comparison','/equipment/comparison',200,0),
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
(317,'Meter Saving','/meter/metersaving',300,1),
(318,'Offline Meter Saving','/meter/offlinemetersaving',300,1),
(319,'Virtual Meter Saving','/meter/virtualmetersaving',300,1),
(320,'Meter Comparison','/meter/metercomparison',300,0),
(321,'Offline Meter Input','/meter/offlinemeterinput',300,0),
(322,'Meter Plan','/meter/meterplan',300,1),
(323,'Offline Meter Plan','/meter/offlinemeterplan',300,1),
(324,'Virtual Meter Plan','/meter/virtualmeterplan',300,1),
(325, 'Virtual Meter Comparison', '/meter/virtualmetercomparison', 300, 0),
(326,'Power Quality','/meter/powerquality',300,0),
(400,'Tenant Data','/tenant',NULL,0),
(401,'Energy Category Data','/tenant/energycategory',400,0),
(402,'Energy Item Data','/tenant/energyitem',400,0),
(403,'Cost','/tenant/cost',400,0),
(404,'Load','/tenant/load',400,0),
(405,'Statistics','/tenant/statistics',400,0),
(406,'Saving','/tenant/saving',400,1),
(407,'Tenant Bill','/tenant/bill',400,0),
(408,'Batch Analysis','/tenant/batch',400,0),
(409,'Carbon','/tenant/carbon',400,0),
(410,'Plan','/tenant/plan',400,1),
(500,'Store Data','/store',NULL,0),
(501,'Energy Category Data','/store/energycategory',500,0),
(502,'Energy Item Data','/store/energyitem',500,0),
(503,'Cost','/store/cost',500,0),
(504,'Load','/store/load',500,0),
(505,'Statistics','/store/statistics',500,0),
(506,'Saving','/store/saving',500,1),
(507,'Batch Analysis','/store/batch',500,0),
(508,'Carbon','/store/carbon',500,0),
(509,'Plan','/store/plan',500,1),
(510,'Store Comparison','/store/comparison',500,0),
(600,'Shopfloor Data','/shopfloor',NULL,0),
(601,'Energy Category Data','/shopfloor/energycategory',600,0),
(602,'Energy Item Data','/shopfloor/energyitem',600,0),
(603,'Cost','/shopfloor/cost',600,0),
(604,'Load','/shopfloor/load',600,0),
(605,'Statistics','/shopfloor/statistics',600,0),
(606,'Saving','/shopfloor/saving',600,1),
(607,'Batch Analysis','/shopfloor/batch',600,0),
(608,'Carbon','/shopfloor/carbon',600,0),
(609,'Plan','/shopfloor/plan',600,1),
(610,'Shopfloor Comparison','/shopfloor/comparison',600,0),
(700,'Combined Equipment Data','/combinedequipment',NULL,0),
(701,'Energy Category Data','/combinedequipment/energycategory',700,0),
(702,'Energy Item Data','/combinedequipment/energyitem',700,0),
(703,'Cost','/combinedequipment/cost',700,0),
(704,'Output','/combinedequipment/output',700,0),
(705,'Income','/combinedequipment/income',700,0),
(706,'Efficiency','/combinedequipment/efficiency',700,0),
(707,'Load','/combinedequipment/load',700,0),
(708,'Statistics','/combinedequipment/statistics',700,0),
(709,'Saving','/combinedequipment/saving',700,1),
(710,'Batch Analysis','/combinedequipment/batch',700,0),
(711,'Carbon','/combinedequipment/carbon',700,0),
(712,'Plan','/combinedequipment/plan',700,1),
(800,'Auxiliary System','/auxiliarysystem',NULL,0),
(801,'Energy Flow Diagram','/auxiliarysystem/energyflowdiagram',800,0),
(802,'Distribution System','/auxiliarysystem/distributionsystem',800,0),
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
  `hourly_low_limit` DECIMAL(21, 6) NOT NULL
  COMMENT 'Inclusive. The default is 0. If the meter has accuracy problems, set the value to a small positive value, such as 0.100',
  `hourly_high_limit` DECIMAL(21, 6) NOT NULL
  COMMENT 'Inclusive. Maximum energy consumption per hour, Rated total active Power, Rated Flow, etc.',
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `master_meter_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_index_1` ON `myems_system_db`.`tbl_meters` (`name`);
CREATE INDEX `tbl_meters_index_2` ON `myems_system_db`.`tbl_meters` (`energy_category_id`);
CREATE INDEX `tbl_meters_index_3` ON `myems_system_db`.`tbl_meters` (`energy_item_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_points_index_1` ON `myems_system_db`.`tbl_meters_points` (`meter_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_commands_index_1` ON `myems_system_db`.`tbl_meters_commands` (`meter_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12, 10) NOT NULL,
  `longitude` DECIMAL(13, 10) NOT NULL,
  `latitude_point_id` BIGINT,
  `longitude_point_id` BIGINT,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `serial_number` VARCHAR(255) NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `svg2_id` BIGINT,
  `svg3_id` BIGINT,
  `svg4_id` BIGINT,
  `svg5_id` BIGINT,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `commissioning_date` DATE,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_index_1` ON `myems_system_db`.`tbl_microgrids` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_batteries`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_batteries` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_batteries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `battery_state_point_id` BIGINT NOT NULL,
  `soc_point_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `charge_meter_id` BIGINT NOT NULL,
  `discharge_meter_id` BIGINT NOT NULL,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `nominal_voltage` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_batteries_index_1` ON `myems_system_db`.`tbl_microgrids_batteries` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_bmses_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_bmses_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_bmses_points_index_1`
ON `myems_system_db`.`tbl_microgrids_bmses_points` (`bms_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_commands_index_1` ON `myems_system_db`.`tbl_microgrids_commands` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_data_sources`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `data_source_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_data_sources_index_1`
ON `myems_system_db`.`tbl_microgrids_data_sources` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_power_conversion_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_power_conversion_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_power_conversion_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `run_state_point_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(21, 6) NOT NULL,
  `today_charge_energy_point_id` BIGINT NOT NULL,
  `today_discharge_energy_point_id` BIGINT NOT NULL,
  `total_charge_energy_point_id` BIGINT NOT NULL,
  `total_discharge_energy_point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_power_conversion_systems_index_1`
ON `myems_system_db`.`tbl_microgrids_power_conversion_systems` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_pcses_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_pcses_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_pcses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pcs_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_pcses_points_index_1`
ON `myems_system_db`.`tbl_microgrids_pcses_points` (`pcs_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_evchargers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_evchargers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_evchargers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_evchargers_index_1` ON `myems_system_db`.`tbl_microgrids_evchargers` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_evchargers_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_evchargers_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_evchargers_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `evcharger_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_evchargers_points_index_1`
ON `myems_system_db`.`tbl_microgrids_evchargers_points` (`evcharger_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_generators`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_generators` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_generators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_output_power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_generators_index_1` ON `myems_system_db`.`tbl_microgrids_generators` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_generators_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_generators_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_generators_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `generator_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_generators_points_index_1`
ON `myems_system_db`.`tbl_microgrids_generators_points` (`generator_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_grids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_grids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_grids_index_1` ON `myems_system_db`.`tbl_microgrids_grids` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_grids_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_grids_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_grids_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `grid_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_grids_points_index_1`
ON `myems_system_db`.`tbl_microgrids_grids_points` (`grid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_heatpumps`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_heatpumps` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_heatpumps` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `electricity_meter_id` BIGINT NOT NULL,
  `heat_meter_id` BIGINT NOT NULL,
  `cooling_meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_heatpumps_index_1` ON `myems_system_db`.`tbl_microgrids_heatpumps` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_heatpumps_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_heatpumps_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_heatpumps_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `heatpump_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_heatpumps_points_index_1`
ON `myems_system_db`.`tbl_microgrids_heatpumps_points` (`heatpump_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_loads`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_loads` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_loads_index_1` ON `myems_system_db`.`tbl_microgrids_loads` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_loads_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_loads_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_loads_points_index_1`
ON `myems_system_db`.`tbl_microgrids_loads_points` (`load_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_photovoltaics`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_photovoltaics` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_photovoltaics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_photovoltaics_index_1` ON `myems_system_db`.`tbl_microgrids_photovoltaics` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_pvs_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_pvs_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_pvs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pv_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_pvs_points_index_1`
ON `myems_system_db`.`tbl_microgrids_pvs_points` (`pv_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_schedules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `peak_type` VARCHAR(8) NOT NULL
  COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep-Valley深谷',
  `power` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_schedules_index_1`
ON `myems_system_db`.`tbl_microgrids_schedules` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_sensors_index_1` ON `myems_system_db`.`tbl_microgrids_sensors` (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_users` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_users_index_1` ON `myems_system_db`.`tbl_microgrids_users` (`microgrid_id`);

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
  `hourly_low_limit` DECIMAL(21, 6)  NOT NULL COMMENT 'Inclusive. Default is 0.',
  `hourly_high_limit` DECIMAL(21, 6)  NOT NULL COMMENT 'Inclusive. Maximum energy consumption per hour.',
  `cost_center_id` BIGINT NOT NULL,
  `energy_item_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_offline_meters_index_1` ON `myems_system_db`.`tbl_offline_meters` (`name`);
CREATE INDEX `tbl_offline_meters_index_2` ON `myems_system_db`.`tbl_offline_meters` (`energy_category_id`);
CREATE INDEX `tbl_offline_meters_index_3` ON `myems_system_db`.`tbl_offline_meters` (`energy_item_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `station_code` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12, 10) NOT NULL,
  `longitude` DECIMAL(13, 10) NOT NULL,
  `latitude_point_id` BIGINT,
  `longitude_point_id` BIGINT,
  `rated_capacity` DECIMAL(21, 6) NOT NULL,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `svg2_id` BIGINT,
  `svg3_id` BIGINT,
  `svg4_id` BIGINT,
  `svg5_id` BIGINT,
  `is_cost_data_displayed` BOOL NOT NULL,
  `phase_of_lifecycle` VARCHAR(255) NOT NULL,
  `commissioning_date` DATE,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_index_1` ON `myems_system_db`.`tbl_photovoltaic_power_stations` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_data_sources`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_data_sources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `data_source_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_data_sources_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_data_sources` (`photovoltaic_power_station_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_grids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_grids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(21, 6) NOT NULL,
  `total_active_power_point_id` BIGINT,
  `active_power_a_point_id` BIGINT,
  `active_power_b_point_id` BIGINT,
  `active_power_c_point_id` BIGINT,
  `total_reactive_power_point_id` BIGINT,
  `reactive_power_a_point_id` BIGINT,
  `reactive_power_b_point_id` BIGINT,
  `reactive_power_c_point_id` BIGINT,
  `total_apparent_power_point_id` BIGINT,
  `apparent_power_a_point_id` BIGINT,
  `apparent_power_b_point_id` BIGINT,
  `apparent_power_c_point_id` BIGINT,
  `total_power_factor_point_id` BIGINT,
  `active_energy_import_point_id` BIGINT,
  `active_energy_export_point_id` BIGINT,
  `active_energy_net_point_id` BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_grids_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_grids` (`photovoltaic_power_station_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_grids_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_grids_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_grids_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `grid_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_grids_points_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_grids_points` (`grid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_invertors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_invertors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_invertors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `model` VARCHAR(255) NOT NULL,
  `serial_number` VARCHAR(255) NOT NULL,
  `invertor_state_point_id` BIGINT NOT NULL,
  `communication_state_point_id`  BIGINT NOT NULL,
  `total_energy_point_id`  BIGINT NOT NULL,
  `generation_meter_id` BIGINT NOT NULL,
  `today_energy_point_id`  BIGINT,
  `efficiency_point_id`  BIGINT,
  `temperature_point_id`  BIGINT,
  `power_factor_point_id`  BIGINT,
  `active_power_point_id`  BIGINT,
  `reactive_power_point_id`  BIGINT,
  `frequency_point_id`  BIGINT,
  `uab_point_id`  BIGINT,
  `ubc_point_id`  BIGINT,
  `uca_point_id`  BIGINT,
  `ua_point_id`  BIGINT,
  `ub_point_id`  BIGINT,
  `uc_point_id`  BIGINT,
  `ia_point_id`  BIGINT,
  `ib_point_id`  BIGINT,
  `ic_point_id`  BIGINT,
  `pv1_u_point_id`  BIGINT,
  `pv1_i_point_id`  BIGINT,
  `pv2_u_point_id`  BIGINT,
  `pv2_i_point_id`  BIGINT,
  `pv3_u_point_id`  BIGINT,
  `pv3_i_point_id`  BIGINT,
  `pv4_u_point_id`  BIGINT,
  `pv4_i_point_id`  BIGINT,
  `pv5_u_point_id`  BIGINT,
  `pv5_i_point_id`  BIGINT,
  `pv6_u_point_id`  BIGINT,
  `pv6_i_point_id`  BIGINT,
  `pv7_u_point_id`  BIGINT,
  `pv7_i_point_id`  BIGINT,
  `pv8_u_point_id`  BIGINT,
  `pv8_i_point_id`  BIGINT,
  `pv9_u_point_id`  BIGINT,
  `pv9_i_point_id`  BIGINT,
  `pv10_u_point_id`  BIGINT,
  `pv10_i_point_id`  BIGINT,
  `pv11_u_point_id`  BIGINT,
  `pv11_i_point_id`  BIGINT,
  `pv12_u_point_id`  BIGINT,
  `pv12_i_point_id`  BIGINT,
  `pv13_u_point_id`  BIGINT,
  `pv13_i_point_id`  BIGINT,
  `pv14_u_point_id`  BIGINT,
  `pv14_i_point_id`  BIGINT,
  `pv15_u_point_id`  BIGINT,
  `pv15_i_point_id`  BIGINT,
  `pv16_u_point_id`  BIGINT,
  `pv16_i_point_id`  BIGINT,
  `pv17_u_point_id`  BIGINT,
  `pv17_i_point_id`  BIGINT,
  `pv18_u_point_id`  BIGINT,
  `pv18_i_point_id`  BIGINT,
  `pv19_u_point_id`  BIGINT,
  `pv19_i_point_id`  BIGINT,
  `pv20_u_point_id`  BIGINT,
  `pv20_i_point_id`  BIGINT,
  `pv21_u_point_id`  BIGINT,
  `pv21_i_point_id`  BIGINT,
  `pv22_u_point_id`  BIGINT,
  `pv22_i_point_id`  BIGINT,
  `pv23_u_point_id`  BIGINT,
  `pv23_i_point_id`  BIGINT,
  `pv24_u_point_id`  BIGINT,
  `pv24_i_point_id`  BIGINT,
  `pv25_u_point_id`  BIGINT,
  `pv25_i_point_id`  BIGINT,
  `pv26_u_point_id`  BIGINT,
  `pv26_i_point_id`  BIGINT,
  `pv27_u_point_id`  BIGINT,
  `pv27_i_point_id`  BIGINT,
  `pv28_u_point_id`  BIGINT,
  `pv28_i_point_id`  BIGINT,
  `mppt_total_energy_point_id`  BIGINT,
  `mppt_power_point_id`  BIGINT,
  `mppt_1_energy_point_id`  BIGINT,
  `mppt_2_energy_point_id`  BIGINT,
  `mppt_3_energy_point_id`  BIGINT,
  `mppt_4_energy_point_id`  BIGINT,
  `mppt_5_energy_point_id`  BIGINT,
  `mppt_6_energy_point_id`  BIGINT,
  `mppt_7_energy_point_id`  BIGINT,
  `mppt_8_energy_point_id`  BIGINT,
  `mppt_9_energy_point_id`  BIGINT,
  `mppt_10_energy_point_id`  BIGINT,
  `startup_time_point_id`  BIGINT,
  `shutdown_time_point_id`  BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_invertors_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_invertors` (`photovoltaic_power_station_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_invertors_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_invertors_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_invertors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `invertor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_invertors_points_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_invertors_points` (`invertor_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_loads`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_loads` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `rated_input_power` DECIMAL(21, 6) NOT NULL,
  `total_active_power_point_id` BIGINT,
  `active_power_a_point_id` BIGINT,
  `active_power_b_point_id` BIGINT,
  `active_power_c_point_id` BIGINT,
  `total_reactive_power_point_id` BIGINT,
  `reactive_power_a_point_id` BIGINT,
  `reactive_power_b_point_id` BIGINT,
  `reactive_power_c_point_id` BIGINT,
  `total_apparent_power_point_id` BIGINT,
  `apparent_power_a_point_id` BIGINT,
  `apparent_power_b_point_id` BIGINT,
  `apparent_power_c_point_id` BIGINT,
  `total_power_factor_point_id` BIGINT,
  `active_energy_import_point_id` BIGINT,
  `active_energy_export_point_id` BIGINT,
  `active_energy_net_point_id` BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_loads_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_loads` (`photovoltaic_power_station_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_loads_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_loads_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_loads_points_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_loads_points` (`load_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_photovoltaic_power_stations_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_users` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_photovoltaic_power_stations_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_photovoltaic_power_stations_users_index_1`
ON `myems_system_db`.`tbl_photovoltaic_power_stations_users` (`photovoltaic_power_station_id`);

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
  `high_limit` DECIMAL(21, 6) NOT NULL,
  `low_limit` DECIMAL(21, 6) NOT NULL ,
  `higher_limit` DECIMAL(21, 6) NULL COMMENT 'Used in FDD Service',
  `lower_limit` DECIMAL(21, 6) NULL COMMENT 'Used in FDD Service',
  `is_in_alarm` BOOL DEFAULT FALSE NOT NULL COMMENT 'Used in FDD Service',
  `ratio` DECIMAL(21, 6) DEFAULT 1.000000 NOT NULL,
  `offset_constant` DECIMAL(21, 6) DEFAULT 0.000000 NOT NULL,
  `is_trend` BOOL NOT NULL,
  `is_virtual` BOOL DEFAULT FALSE NOT NULL,
  `address` LONGTEXT NOT NULL COMMENT 'Address MUST be in JSON format',
  `description` VARCHAR(255),
  `faults` LONGTEXT COMMENT 'Faults MUST be in JSON format',
  `definitions` LONGTEXT COMMENT 'Definitions MUST be in JSON format',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_points_index_1` ON `myems_system_db`.`tbl_points` (`name`);
CREATE INDEX `tbl_points_index_2` ON `myems_system_db`.`tbl_points` (`data_source_id`);
CREATE INDEX `tbl_points_index_3` ON `myems_system_db`.`tbl_points` (`id`, `object_type`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_points_set_values`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_points_set_values` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_points_set_values` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `point_id` BIGINT NOT NULL,
  `utc_date_time` DATETIME NOT NULL,
  `set_value` DECIMAL(21, 6) NOT NULL,
  `is_set` BOOL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_points_set_values_index_1` ON `myems_system_db`.`tbl_points_set_values` (`point_id`, `utc_date_time`);
CREATE INDEX `tbl_points_set_values_index_2` ON `myems_system_db`.`tbl_points_set_values` (`utc_date_time`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_power_integrators`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_power_integrators` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_power_integrators` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `result_point_id` BIGINT NOT NULL,
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_power_integrators_index_1` ON `myems_system_db`.`tbl_power_integrators` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_protocols`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_protocols` ;

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
(19,'MQTT EG200', 'mqtt-eg200'),
(20,'MQTT Huiju', 'mqtt-huiju'),
(21,'MQTT MD4220', 'mqtt-md4220'),
(22,'MQTT SEG', 'mqtt-seg'),
(23,'MQTT Weilan', 'mqtt-weilan'),
(24,'MQTT Xintianli', 'mqtt-xintianli'),
(25,'MQTT Zhongxian', 'mqtt-zhongxian'),
(26,'MQTT', 'mqtt'),
(27,'MySQL', 'mysql'),
(28,'OPC UA', 'opc-ua'),
(29,'Oracle', 'oracle'),
(30,'Postgresql', 'postgresql'),
(31,'Profibus', 'profibus'),
(32,'PROFINET', 'profinet'),
(33,'S7', 's7'),
(34,'Simulation', 'simulation'),
(35,'SQL Server', 'sqlserver'),
(36,'TDengine', 'tdengine'),
(37,'Weather', 'weather');
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
CREATE INDEX `tbl_sensors_index_1` ON `myems_system_db`.`tbl_sensors` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_sensors_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_sensors_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_sensors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sensor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_sensors_points_index_1` ON `myems_system_db`.`tbl_sensors_points` (`sensor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `area` DECIMAL(21, 6) NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `contact_id` BIGINT,
  `cost_center_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_index_1` ON `myems_system_db`.`tbl_shopfloors` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_commands_index_1` ON `myems_system_db`.`tbl_shopfloors_commands` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_equipments_index_1` ON `myems_system_db`.`tbl_shopfloors_equipments` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_meters_index_1` ON `myems_system_db`.`tbl_shopfloors_meters` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_offline_meters_index_1`
ON `myems_system_db`.`tbl_shopfloors_offline_meters` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_points_index_1` ON `myems_system_db`.`tbl_shopfloors_points` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_sensors_index_1` ON `myems_system_db`.`tbl_shopfloors_sensors` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_virtual_meters_index_1`
ON `myems_system_db`.`tbl_shopfloors_virtual_meters` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_working_calendars_index_1`
ON `myems_system_db`.`tbl_shopfloors_working_calendars` (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `parent_space_id` BIGINT,
  `area` DECIMAL(21, 6) NOT NULL,
  `number_of_occupants` DECIMAL(21, 6) NOT NULL DEFAULT 1.000,
  `timezone_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `contact_id` BIGINT,
  `cost_center_id` BIGINT,
  `latitude` DECIMAL(12, 10),
  `longitude` DECIMAL(13, 10),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_index_1` ON `myems_system_db`.`tbl_spaces` (`name`);
CREATE INDEX `tbl_spaces_index_2` ON `myems_system_db`.`tbl_spaces` (`parent_space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Default Data for table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
INSERT INTO `myems_system_db`.`tbl_spaces`
(`id`, `name`, `uuid`, `parent_space_id`, `area`, `timezone_id`, `contact_id`, `is_input_counted`, `is_output_counted`,
 `cost_center_id`, `latitude`, `longitude`, `description`)
VALUES
-- DO NOT deleted the record which ID is 1. It's the root space.
(1, 'MyEMS', '9dfb7cff-f19f-4a1e-8c79-3adf6425bfd9', NULL, 99999.999, 56, 1, true, true, 1, 39.9151191111, 116.4039631111,
 'MyEMS Space');

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_charging_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_charging_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_charging_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `charging_station_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_charging_stations_index_1`
ON `myems_system_db`.`tbl_spaces_charging_stations` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_combined_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_combined_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `combined_equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_combined_equipments_index_1`
ON `myems_system_db`.`tbl_spaces_combined_equipments` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_commands_index_1` ON `myems_system_db`.`tbl_spaces_commands` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_distribution_systems`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_distribution_systems` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_distribution_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `distribution_system_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_distribution_systems_index_1` ON `myems_system_db`.`tbl_spaces_distribution_systems` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_energy_flow_diagrams`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_energy_flow_diagrams` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_energy_flow_diagrams` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_flow_diagram_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_energy_flow_diagrams_index_1`
ON `myems_system_db`.`tbl_spaces_energy_flow_diagrams` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_energy_storage_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_energy_storage_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_energy_storage_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_energy_storage_power_stations_index_1`
ON `myems_system_db`.`tbl_spaces_energy_storage_power_stations` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_equipments` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_equipments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `equipment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_equipments_index_1` ON `myems_system_db`.`tbl_spaces_equipments` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_meters_index_1` ON `myems_system_db`.`tbl_spaces_meters` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_microgrids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_microgrids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_microgrids_index_1` ON `myems_system_db`.`tbl_spaces_microgrids` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_offline_meters_index_1` ON `myems_system_db`.`tbl_spaces_offline_meters` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_photovoltaic_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_photovoltaic_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_photovoltaic_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `photovoltaic_power_station_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_photovoltaic_power_stations_index_1`
ON `myems_system_db`.`tbl_spaces_photovoltaic_power_stations` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_points_index_1` ON `myems_system_db`.`tbl_spaces_points` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_sensors_index_1` ON `myems_system_db`.`tbl_spaces_sensors` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_shopfloors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_shopfloors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `shopfloor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_sensors_index_1` ON `myems_system_db`.`tbl_spaces_shopfloors` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_stores`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_stores` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_stores` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `store_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_stores_index_1` ON `myems_system_db`.`tbl_spaces_stores` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_tenants` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_tenants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `tenant_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_tenants_index_1` ON `myems_system_db`.`tbl_spaces_tenants` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_virtual_meters_index_1` ON `myems_system_db`.`tbl_spaces_virtual_meters` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_wind_farms`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_wind_farms` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_wind_farms` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `wind_farm_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_wind_farms_index_1` ON `myems_system_db`.`tbl_spaces_wind_farms` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_working_calendars_index_1` ON `myems_system_db`.`tbl_spaces_working_calendars` (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tariffs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_category_id` BIGINT NOT NULL,
  `tariff_type` VARCHAR(45) NOT NULL COMMENT 'Tariff Type: timeofuse - Time of Use Pricing分时费率(单一费率按平设置)\n',
  `unit_of_price` VARCHAR(45) NOT NULL,
  `valid_from_datetime_utc` DATETIME NOT NULL,
  `valid_through_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tariffs_index_1` ON `myems_system_db`.`tbl_tariffs` (`name`);
CREATE INDEX `tbl_tariffs_index_2`
ON `myems_system_db`.`tbl_tariffs` (`energy_category_id`, `valid_from_datetime_utc`, `valid_through_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tariffs_timeofuses`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tariffs_timeofuses` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tariffs_timeofuses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tariff_id` BIGINT NOT NULL,
  `start_time_of_day` TIME NOT NULL,
  `end_time_of_day` TIME NOT NULL,
  `peak_type` VARCHAR(8) NOT NULL
  COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep-Valley深谷',
  `price` DECIMAL(21, 6) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tariffs_timeofuses_index_1`
ON `myems_system_db`.`tbl_tariffs_timeofuses` (`tariff_id`, `start_time_of_day`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12, 10) NOT NULL,
  `longitude` DECIMAL(13, 10) NOT NULL,
  `area` DECIMAL(21, 6) NOT NULL,
  `store_type_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_index_1` ON `myems_system_db`.`tbl_stores` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_commands_index_1` ON `myems_system_db`.`tbl_stores_commands` (`store_id`);

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
CREATE INDEX `tbl_store_types_index_1` ON `myems_system_db`.`tbl_store_types` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_stores_meters_index_1` ON `myems_system_db`.`tbl_stores_meters` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_stores_offline_meters_index_1` ON `myems_system_db`.`tbl_stores_offline_meters` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_points_index_1` ON `myems_system_db`.`tbl_stores_points` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_sensors_index_1` ON `myems_system_db`.`tbl_stores_sensors` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_virtual_meters_index_1` ON `myems_system_db`.`tbl_stores_virtual_meters` (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_working_calendars_index_1` ON `myems_system_db`.`tbl_stores_working_calendars` (`store_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_svgs`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_svgs` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_svgs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `source_code` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_svgs_index_1` ON `myems_system_db`.`tbl_svgs` (`name`);

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
  `area` DECIMAL(21, 6) NOT NULL,
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
CREATE INDEX `tbl_tenants_index_1` ON `myems_system_db`.`tbl_tenants` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_commands_index_1` ON `myems_system_db`.`tbl_tenants_commands` (`tenant_id`);

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
CREATE INDEX `tbl_tenant_types_index_1` ON `myems_system_db`.`tbl_tenant_types` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_tenants_meters_index_1` ON `myems_system_db`.`tbl_tenants_meters` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_offline_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_offline_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `offline_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
  CREATE INDEX `tbl_tenants_offline_meters_index_1` ON `myems_system_db`.`tbl_tenants_offline_meters` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_points`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_points` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_points_index_1` ON `myems_system_db`.`tbl_tenants_points` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_sensors_index_1` ON `myems_system_db`.`tbl_tenants_sensors` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_virtual_meters` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_virtual_meters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `virtual_meter_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_virtual_meters_index_1` ON `myems_system_db`.`tbl_tenants_virtual_meters` (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `working_calendar_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_working_calendars_index_1` ON `myems_system_db`.`tbl_tenants_working_calendars` (`tenant_id`);

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
CREATE INDEX `tbl_virtual_meters_index_1` ON `myems_system_db`.`tbl_virtual_meters` (`name`);
CREATE INDEX `tbl_virtual_meters_index_2` ON `myems_system_db`.`tbl_virtual_meters` (`energy_category_id`);
CREATE INDEX `tbl_virtual_meters_index_3` ON `myems_system_db`.`tbl_virtual_meters` (`energy_item_id`);

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
CREATE INDEX `tbl_variables_index_1` ON `myems_system_db`.`tbl_variables` (`virtual_meter_id`);
CREATE INDEX `tbl_variables_index_2`
ON `myems_system_db`.`tbl_variables` (`meter_id`, `meter_type`, `virtual_meter_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_virtual_power_plants`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_virtual_power_plants` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_power_plants` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `balancing_price_point_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_power_plants_index_1` ON `myems_system_db`.`tbl_virtual_power_plants` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_virtual_power_plants_microgrids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_virtual_power_plants_microgrids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_virtual_power_plants_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `virtual_power_plant_id` BIGINT NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_virtual_power_plants_microgrids_index_1`
ON `myems_system_db`.`tbl_virtual_power_plants_microgrids` (`virtual_power_plant_id`);

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
INSERT INTO `myems_system_db`.`tbl_versions`
(`id`, `version`, `release_date`)
VALUES
(1, '5.10.0', '2025-10-26');

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_wind_farms`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_wind_farms` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_wind_farms` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(12, 10) NOT NULL,
  `longitude` DECIMAL(13, 10) NOT NULL,
  `latitude_point_id` BIGINT,
  `longitude_point_id` BIGINT,
  `rated_power` DECIMAL(21, 6) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg_id` BIGINT NOT NULL,
  `svg2_id` BIGINT,
  `svg3_id` BIGINT,
  `svg4_id` BIGINT,
  `svg5_id` BIGINT,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_wind_farms_index_1` ON `myems_system_db`.`tbl_wind_farms` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_working_calendars`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_working_calendars` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_working_calendars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(64),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_working_calendars_index_1` ON `myems_system_db`.`tbl_working_calendars` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_working_calendars_non_working_days`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_working_calendars_non_working_days` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_working_calendars_non_working_days` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `working_calendar_id` BIGINT NOT NULL,
  `date_local` DATE NOT NULL,
  `description` VARCHAR(64),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_working_calendars_non_working_days_index_1`
ON `myems_system_db`.`tbl_working_calendars_non_working_days` (`working_calendar_id`);
