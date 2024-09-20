-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.8.0 TO 4.9.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `minimum_voltage_battery_cell_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `minimum_voltage_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `maximum_voltage_battery_cell_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `maximum_voltage_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `minimum_temperature_battery_cell_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `minimum_temperature_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `maximum_temperature_battery_cell_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `maximum_temperature_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `negative_insulation_value_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `positive_insulation_value_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `insulation_value_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `average_voltage_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `average_temperature_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `dischargeable_capacity_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `rechargeable_capacity_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `discharge_limit_power_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `charging_power_limit_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `soh_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `total_current_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `total_voltage_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `grid_status_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `communication_status_with_ems_point_id` BIGINT NULL AFTER `nominal_voltage`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_batteries
ADD `communication_status_with_pcs_point_id` BIGINT NULL AFTER `nominal_voltage`;


ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems MODIFY COLUMN today_charge_energy_point_id bigint NULL;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems MODIFY COLUMN today_discharge_energy_point_id bigint NULL;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems MODIFY COLUMN total_charge_energy_point_id bigint NULL;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems MODIFY COLUMN total_discharge_energy_point_id bigint NULL;


ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `dc_current_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `dc_voltage_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `dc_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `air_outlet_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `air_inlet_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `c2_module_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `b2_module_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `a2_module_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `c1_module_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `b1_module_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `a1_module_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `pcs_ambient_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `pcs_module_temperature_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_c_current_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_b_current_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_a_current_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_c_voltage_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_b_voltage_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_a_voltage_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `ca_current_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `bc_current_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `ab_current_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `ca_voltage_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `bc_voltage_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `ab_voltage_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_c_apparent_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_b_apparent_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_a_apparent_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_c_reactive_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_b_reactive_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_a_reactive_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_c_active_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_b_active_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `phase_a_active_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `ac_frequency_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `total_ac_power_factor_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `total_ac_apparent_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `total_ac_reactive_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `total_ac_active_power_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `control_mode_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `device_status_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems
ADD `grid_connection_status_point_id` BIGINT NULL AFTER `total_discharge_energy_point_id`;

CREATE TABLE IF NOT EXISTS `myems_production_db`.`tbl_space_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `product_id` BIGINT NOT NULL,
  `product_count` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_space_hourly_index_1`
ON `myems_production_db`.`tbl_space_hourly` (`space_id`, `product_id`, `start_datetime_utc`);

INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden)
VALUES
(113,'Production','/space/production',100,1),
(114,'Enter Production','/space/enterproduction',100,1);


ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `active_energy_net_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `active_energy_export_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `active_energy_import_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `total_power_factor_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `apparent_power_c_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `apparent_power_b_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `apparent_power_a_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `total_apparent_power_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `reactive_power_c_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `reactive_power_b_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `reactive_power_a_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `total_reactive_power_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `active_power_c_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `active_power_b_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `active_power_a_point_id` BIGINT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_grids
ADD `total_active_power_point_id` BIGINT NULL AFTER `capacity`;


ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `active_energy_net_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `active_energy_export_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `active_energy_import_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `total_power_factor_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `apparent_power_c_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `apparent_power_b_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `apparent_power_a_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `total_apparent_power_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `reactive_power_c_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `reactive_power_b_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `reactive_power_a_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `total_reactive_power_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `active_power_c_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `active_power_b_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `active_power_a_point_id` BIGINT NULL AFTER `rated_input_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_loads
ADD `total_active_power_point_id` BIGINT NULL AFTER `rated_input_power`;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_firecontrols` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `inside_temperature_point_id` BIGINT, -- 内置温度值
  `outside_temperature_point_id` BIGINT, -- 外置温度值
  `temperature_alarm_point_id` BIGINT, -- 温度报警状态
  `smoke_sensor_value_point_id` BIGINT, -- 烟雾传感器值
  `smoke_sensor_alarm_point_id` BIGINT, -- 烟雾传感器报警状态
  `battery_safety_detection_sensor_value_point_id` BIGINT, -- 电池安全检测传感器值
  `battery_safety_detection_sensor_alarm_point_id` BIGINT, -- 电池安全检测传感器报警状态
  `fire_extinguishing_device_status_point_id` BIGINT, -- 灭火装置状态值
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_firecontrols_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_firecontrols` (`energy_storage_container_id`);


CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_hvacs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `working_status_point_id` BIGINT,
  `indoor_fan_status_point_id` BIGINT,
  `outdoor_fan_status_point_id` BIGINT,
  `emergency_fan_status_point_id` BIGINT,
  `compressor_status_point_id` BIGINT,
  `electric_heating_status_point_id` BIGINT,
  `coil_temperature_point_id` BIGINT,
  `temperature_outside_point_id` BIGINT,
  `temperature_inside_point_id` BIGINT,
  `condensation_temperature_point_id` BIGINT,
  `outlet_air_temperature_point_id` BIGINT,
  `return_air_temperature_point_id` BIGINT,
  `exhaust_temperature_point_id` BIGINT,
  `heating_on_temperature_point_id` BIGINT,
  `heating_off_temperature_point_id` BIGINT,
  `cooling_on_temperature_point_id` BIGINT,
  `cooling_off_temperature_point_id` BIGINT,
  `high_temperature_alarm_set_point_id` BIGINT,
  `low_temperature_alarm_set_point_id` BIGINT,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_hvacs_index_1`
ON `myems_system_db`.`tbl_energy_storage_containers_hvacs` (`energy_storage_container_id`);

DROP TABLE myems_system_db.tbl_energy_storage_containers_sensors;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.9.0RC', release_date='2024-09-09' WHERE id=1;

COMMIT;

